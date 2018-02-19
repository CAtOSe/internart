const args = process.argv.slice(2);
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const { Pool } = require('pg')
const pgSession = require('connect-pg-simple')(session);
var passport = require('passport')
var Strategy = require('passport-local').Strategy

const staticRouter = require('./routers/static')
const site = require('./routers/site')
const gallery = require('./routers/gallery')

const userAPI = require('./apis/user')


var app = express()
app.set('view engine', 'ejs')
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

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

app.use(session({
  store: new pgSession({
    pool : pool,                // Connection pool
    tableName : 'user_sessions'   // Use another table-name than the default "session" one
  }),
  secret: 'ilovepc',
  resave: false,
  saveUninitialized: true
}))

passport.use(new Strategy(
  function(username, password, cb) {
    userAPI.findUserByLoginName(pool, username, (response) => {
      if (response.status.code != 200) { return cb(response); }
      if (response.status.code == 204) { return cb(null, false); }
      if (response.status.data.password != password) { return cb(null, false); }
      return cb(null, user);
    }, true);
}));
app.use(passport.initialize());
app.use(passport.session());

require('./routers/user')(app, passport, Strategy, pool)

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

app.get('*', (req, res) => {
  res.status(404).render('404');
})

app.all('*', (req, res) => {
  res.status(404).send("404")
})

app.listen(80, (req, res) => {
  console.log("Listening")
})
