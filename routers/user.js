module.exports = function(app, pool) {

//LOGIN
app.get('/login', (req, res) => {
	res.render('user/login');
});

// USERS
app.get('/u/:userID',(req,res)=>{
  res.render('user/user', {userID: req.params['userID']});
});

}
