var express = require('express')
var router = express.Router()

router.all('/gallery',(req,res)=>{
  res.render('gallery/main')
})

module.exports = router
