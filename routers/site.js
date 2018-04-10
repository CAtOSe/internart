var express = require('express');
var router = express.Router();

router.all('/', (req, res) => {
  res.render('site/landing');
});

module.exports = router;
