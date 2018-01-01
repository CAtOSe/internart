var express = require('express')
var site = require('./routers/site');
var gallery = require('./routers/gallery');
var user = require('./routers/user');
var app = express()
app.set('view engine', 'ejs')

app.use('/assets', express.static('assets'))
app.use('/', site)
app.use('/', gallery)
app.use('/', user)

app.all('*', (req, res) => {
  res.status(404).render('404');
})

app.listen(80, (req, res) => {
  console.log("Listening")
})
