var express = require('express')
var app = express()
var site = require('./routers/site');
app.set('view engine','ejs')

app.use('/',site)

app.listen(80,(req, res) =>{
    console.log("Listening")
})