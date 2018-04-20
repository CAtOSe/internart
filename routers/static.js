var express = require('express');
var router = express.Router();

// SITE
router.get('/', (req, res) => {
  res.render('gallery/main');
});

router.get('/login', (req, res) => {
	res.render('site/login');
});


// GALLERY
router.get('/gallery/upload', (req, res) => {
  res.render('gallery/upload');
});

// USER
router.get('/u/:userID',(req,res)=>{
  res.render('user/user', {userID: req.params['userID']});
});

module.exports = router;
