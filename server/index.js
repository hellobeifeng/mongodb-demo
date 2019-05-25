const express = require('express');
const hero = require('./router/hero')
const student = require('./router/student')
const population = require('./router/population')
const mongoose = require("mongoose");
const bodyParser = require("body-parser")

var db = mongoose.connect('mongodb://localhost:27017/myDbs');
const con = mongoose.connection;
con.on('error', console.error.bind(console, '连接数据库失败'));
con.once('open',()=>{
  console.log('数据库连接成功', 'mongodb://localhost:27017/myDbs')
})

const app = express()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/api',hero)
app.use('/api2',student)
app.use('/api3', population)
app.listen(3000,() => {
    console.log('app listening on port 3000.')
})


