module.exports = function(app, pool, userAPI, galleryAPI) {

//LOGIN
app.get('/login', (req, res) => {
	res.render('user/login');
});

// USERS
app.get('/u/:userID',(req,res) => {
	userAPI.getUserByID(pool, req.params['userID'], (user) => {
		if (user.status.code == 200) {
			galleryAPI.getArtworkList(pool, userAPI, req.params['userID'], (response) => {
	      if (response.status.code == 200) {
					res.render('user/user', {
						userID: user.data.id,
						fullname: user.data.fullname,
						description: user.data.description,
						artwork: response.data
					});
	      } else {
					res.render('user/user', {
						userID: user.data.id,
						fullname: user.data.fullname,
						description: user.data.description,
						artwork: false
					});
	      }
	    });
		} else {
			res.render('404');
		}
	});
});

}
