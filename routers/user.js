var express = require('express')
var router = express.Router()

router.all('/u/:userID',(req,res)=>{
  var user = {
    name: 'CAtOSe',
    id: req.params['userID']
  }
  res.render('user/user', {user: user})
})

module.exports = router
