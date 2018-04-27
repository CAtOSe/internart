const express = require('express');

const staticRouter = require('./routers/static');

var app = express();
app.set('view engine', 'ejs');

app.use('/assets', express.static('assets'));
app.use('/', staticRouter);

app.get('*', (req, res) => {
  res.status(404).render('404');
});

app.all('*', (req, res) => {
  res.status(404).send("404");
});

app.listen(80, (req, res) => {
  console.log("Listening");
});
