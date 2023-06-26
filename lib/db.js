const mysql=require('mysql');


const connection = mysql.createConnection({
    host:'database-1.ccp6phwdjkq8.ap-northeast-2.rds.amazonaws.com',
    user:'admin',
    password:'11111111',
    database:'accounts',
    port:'3306',
    dateStrings: 'date',
    multipleStatements: true,
})

connection.connect();

module.exports =connection;