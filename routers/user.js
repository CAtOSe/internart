module.exports = function(app, pool, userAPI, galleryAPI) {

//LOGIN
app.get('/login', (req, res) => {
	res.render('user/login');
});

// USERS
app.get('/u/:userID',(req, res) => {
	userAPI.getUserByID(pool, req.params['userID'], (user) => {
		if (user.status.code == 200) {
			galleryAPI.getArtworkList(pool, userAPI, {
				id: req.params['userID'],
				session: req.session.userID
			}, (response) => {
	      if (response.status.code == 200) {
					res.render('user/user', {
						userID: user.data.id,
						fullname: user.data.fullname,
						description: user.data.description,
						artwork: response.data,
						reqUser: req.session.userID
					});
	      } else {
					res.render('user/user', {
						userID: user.data.id,
						fullname: user.data.fullname,
						description: user.data.description,
						artwork: false,
						reqUser: req.session.userID
					});
	      }
	    });
		} else {
			res.render('404');
		}
	});
});

app.get('/editUser', (req, res) => {
	userAPI.getUserByReq(pool, req, (user) => {
		if (user.status.code == 200) {
			userAPI.getUserByReq(pool, req, (user) => {
	      if (user.status.code == 200) {
	        res.render('user/edit', {
	          userID: user.data.id,
	          fullname: user.data.fullname,
	          description: user.data.description,
	          artwork: false,
	          reqUser: req.session.userID
	        });
	      } else {
	        res.setHeader('Content-Type', 'application/json');
	        res.send(JSON.stringify(user));
	      }
	    });
		} else {
			res.redirect('/login');
		}
	});
});

}
