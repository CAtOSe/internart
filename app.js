const args = process.argv.slice(2);
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);
const busboy = require('connect-busboy');
const fs = require('fs');

const userAPI = require('./apis/userAPI');
const galleryAPI = require('./apis/galleryAPI');


var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(busboy());
app.use(cookieParser());

const pool = new Pool({
  user: args[1],
  host: args[0],
  password: args[2],
  database: 'internart',
  port: '5432'
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

app.use(session({
  store: new pgSession({
    pool : pool,                // Connection pool
    tableName : 'user_sessions'   // Use another table-name than the default "session" one
  }),
  secret: 'ilovepc',
  resave: false,
  saveUninitialized: false,
  secure: true
}));

require('./routers/userAPIr')(app, pool, userAPI);
require('./routers/galleryAPIr')(app, pool, galleryAPI, fs, userAPI);
require('./routers/gallery')(app, pool, galleryAPI, userAPI);
require('./routers/user')(app, pool, userAPI, galleryAPI);
require('./routers/site')(app, pool, fs);

app.use('/assets', express.static('assets'));
app.use('/artwork', express.static('artwork'));

app.all('/api/*', (req, res) => {
  var response={
    status:{
      code: 400,
      message: "API call not found"
    }
  };
  res.status(response['status']['code']).send(JSON.stringify(response));
});

app.get('*', (req, res) => {
  res.status(404).render('404');
});

app.all('*', (req, res) => {
  res.status(404).send("404");
});

app.listen(80, (req, res) => {
  console.log("Listening");
});
