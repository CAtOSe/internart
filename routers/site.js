var express = require('express')
var router = express.Router()

router.all('/', (req, res) => {
  res.render('site/landing')
})

router.get('/test', (req, res) => {
  res.render('test')
})

module.exports = router
