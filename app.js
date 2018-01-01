var express = require('express')
var app = express()
var site = require('./routers/site');
var gallery = require('./routers/gallery');
var user = require('./routers/user');
app.set('view engine', 'ejs')

app.use('/', site)
app.use('/', gallery)
app.use('/', user)

app.all('*', (req, res) => {
  res.status(404).render('404');
})

app.listen(80, (req, res) => {
  console.log("Listening")
})
