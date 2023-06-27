const express = require('express');
const fs= require('fs');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app=express();
const url=require('url');
const http = require('http');
const connection =require('./lib/db')




// connection.query('create table accountslist(번호 INT NOT NULL PRIMARY KEY AUTO_INCREMENT,날짜 date NOT NULL,구분 VARCHAR(15) NOT NULL,항목 VARCHAR(15) NOT NULL,지출 INT NULL,수입 INT NULL,메모 VARCHAR(15) NULL);', (error, results, fields) => {
//     if(error) throw error;
//     console.log("table 생성 완료!");
// });



// // 테이블 데이터 추가
// connection.query('insert into accountslist(날짜,구분,항목,지출,수입,메모 ) values (\'2023-05-15\', \'급여\', \'월급\',0,1000000,"더많이벌자"), (\'2023-05-15\', \'복지\', \'음료수\',5000,0,"지출을줄이자"),(\'2023-05-16\', \'교통비\', \'지하철\',1500,0,"비싸다"),(\'2023-05-17\', \'외식\', \'소고기\',35000,0,"지출을줄이자");', (error, results, fields)=>{
//     if(error) throw error;
//     console.log(results);
// });




app.use(bodyParser.urlencoded({
    extended:false,
}));


app.use(express.static(`${__dirname}/public`));


// list.html 읽어와서 테이블 데이터 뿌려주기
app.get('/', (request, response) => {
    fs.readFile('public/list.html', 'utf-8', (error,data)=>{
        let sql='select *, sum(수입-지출) over(ORDER BY 번호,날짜) as 잔액 from accountslist order by 날짜 ASC, 번호 ASC';
        connection.query(sql ,  (error, results, fields) => {
            if (error) throw error;
            const expenditure=results.map(results => results.지출);
            const income=results.map(results=> results.수입);
            const expendituretotal=expenditure.reduce((a,b)=> (a+b),0);
            const incometotal=income.reduce((a,b) => (a+b),0);
            response.send(ejs.render(data,{
                data:results,
                expendituretotal:expendituretotal,
                incometotal:incometotal,
                }));
            });      
      });
});




//검색


app.get('/search', (request, response) => {
  let queryselect = request.query.search;
  let querykeyword = request.query.keyword;
  let querydate = request.query.date;
  fs.readFile('public/list.html', 'utf-8', (error,data)=>{
    if(queryselect==="전체"){
      connection.query(`select *,sum(수입-지출) over(ORDER BY 번호,날짜) as 잔액 from accountslist where 구분 like ? or 항목 LIKE ? or 지출 LIKE ? or 수입 LIKE ? or 메모 LIKE ? order by 날짜 ASC, 번호 ASC`, [`%${querykeyword}%`,`%${querykeyword}%`,`%${querykeyword}%`,`%${querykeyword}%`,`%${querykeyword}%`], (error, results, fields) => {
        if (error) throw error;
            const expenditure=results.map(results => results.지출);
            const income=results.map(results=> results.수입);
            const expendituretotal=expenditure.reduce((a,b)=> (a+b) ,0);
            const incometotal=income.reduce((a,b) => (a+b), 0);
            response.send(ejs.render(data,{
              data:results,
              expendituretotal:expendituretotal,
              incometotal:incometotal,
            }));
        }); 
      }
      else{
        connection.query(`select *,sum(수입-지출) over(ORDER BY 번호,날짜) as 잔액 FROM accountslist where ${queryselect} LIKE ? order by 날짜 ASC, 번호 ASC`,`%${querykeyword}%`, (error, results, fields) => {
          if (error) throw error;
             const expenditure=results.map(results => results.지출);
             const income=results.map(results=> results.수입);
             const expendituretotal=expenditure.reduce((a,b)=> (a+b),0);
             const incometotal=income.reduce((a,b) => (a+b),0);
             response.send(ejs.render(data,{
              data:results,
              expendituretotal:expendituretotal,
              incometotal:incometotal,
              }));
          });
      }
   });
});



// 입력버튼 클릭시 입력페이지 불러오기
app.get('/create', (request, response) => {
    fs.readFile('public/insertaccounts.html', 'utf-8', (error,data)=>{
         if (error) throw error;
         response.send(data);
    })
  });



// 테이블 데이터 추가페이지 열기  post 요청이 발생하면
app.post('/create' , (request, response) => {
    const body = request.body;
    connection.query('insert into accountslist(날짜,구분,항목,지출,수입,메모) VALUE (?, ? ,? ,?, ?, ?)', 
    [body.날짜, body.구분, body.항목, body.지출,body.수입,body.메모], () => {
        response.redirect('/');  // 리스트있는 페이지로 돌아가
    });
});



// 테이블 데이터 수정페이지
app.get('/modify/:id', (request, response) => {
    fs.readFile('public/modify.html', 'utf-8', (error, data) => {
      connection.query('SELECT * from accountslist WHERE 번호 =?', [request.params.id], (error, results) => {
        if (error) throw error;
        response.send(ejs.render(data, {
          data: results[0],
        }));
      });
    });
  });

  
app.post('/modify/:id' , (request, response) => {
    const body = request.body;
    connection.query('update accountslist set 날짜 = ? , 구분 = ? , 항목 = ?, 지출 = ?, 수입 = ? ,  메모 = ? where 번호=?', [body.날짜, body.구분, body.항목, body.지출,body.수입,body.메모,request.params.id], () => {
       response.redirect('/');  // 리스트있는 페이지로 돌아가
    });
});


// 데이터 삭제
app.get('/delete/:id', (request, response) => {   
      connection.query('delete from accountslist WHERE 번호 =?', [request.params.id], (error, results) => {
        if (error) throw error;
        response.redirect('/');
    });
  });


app.listen(3000, () => {
    console.log('Server is running port 3000!');
    //데이터 베이스 연결
});