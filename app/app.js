const express = require('express');

const app = express();

app.get('/healthcheck',(req,res)=>{
  return res.end('OK')
})

app.get('/',(req,res)=>{
  return res.sendFile(__dirname + '/utils/public/views/index.html');
})




module.exports = app;

