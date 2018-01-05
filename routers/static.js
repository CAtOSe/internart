var express = require('express')
var router = express.Router()

// SITE
router.all('/', (req, res) => {
  res.render('site/landing')
})


// GALLERY
router.all('/gallery',(req,res)=>{
  res.render('gallery/main')
})


// USER
router.get('/u/:userID',(req,res)=>{
  res.render('user/user', {userID: req.params['userID']})
})

module.exports = router
