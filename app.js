var express = require('express')
var bodyParser = require('body-parser')
var staticRouter = require('./routers/static');
var site = require('./routers/site');
var gallery = require('./routers/gallery');
var user = require('./routers/user');
var app = express()
app.set('view engine', 'ejs')
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

app.use('/assets', express.static('assets'))
app.use('/', staticRouter)
app.use('/', site)
app.use('/', gallery)
app.use('/', user)

app.all('/api/*', (req, res) => {
  var response={
    status:{
      code: 400,
      message: "API call not found"
    }
  }
  res.status(response['status']['code']).send(JSON.stringify(response))
})

app.all('*', (req, res) => {
  res.status(404).render('404');
})

app.listen(80, (req, res) => {
  console.log("Listening")
})
