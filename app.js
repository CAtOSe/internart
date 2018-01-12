var args = process.argv.slice(2);
var express = require('express')
var passport = require('passport')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var flash = require('connect-flash')
const { Pool } = require('pg')

var staticRouter = require('./routers/static')
var site = require('./routers/site')
var gallery = require('./routers/gallery')


var app = express()
app.set('view engine', 'ejs')
app.use(cookieParser());
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))


app.use(session({ secret: 'iloveapple' }))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())


const pool = new Pool({
  user: args[1],
  host: args[0],
  password: args[2],
  database: 'internart',
  port: '5432'
})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

require('./routers/user')(app, passport, pool)

app.use('/assets', express.static('assets'))
app.use('/', staticRouter)
app.use('/', site)
app.use('/', gallery)

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
