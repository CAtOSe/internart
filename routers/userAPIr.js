module.exports = function(app, pool, userAPI) {

  app.post('/api/u/getUser', (req, res) => {
    if(req.body.userID == undefined){
      let response = {
        status: {
          code: 400,
          message: "UserID undefined"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
      return;
    }
    userAPI.getUserByID(pool, req.body.userID, (user) => {
      if (userAPI.isLoggedIn(req)) {
        userAPI.checkUserPermission(pool, {'userID': req.session.userID}, 'seeEmail', (result) => {
          if (result.data.value == 1) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(user));
          } else {
            delete user.data.email;
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(user));
          }
        });
      } else {
        delete user.data.email;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(user));
      }
    });
  });


  app.post('/api/u/createUser', (req, res) => {
    if(req.body.userData == undefined){
      let response = {
        status: {
          code: 400,
          message: "User data undefined"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
      return;
    }
    let userData = JSON.parse(req.body.userData);
    userAPI.createUser(pool, userData, (response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    });
  });


  app.post('/api/u/deleteUser', (req, res) => {
    if(req.body.userID == undefined){
      let response = {
        status: {
          code: 400,
          message: "userID undefined"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
      return;
    }

    userAPI.deleteUser(pool, req.body.userID, (response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    });
  });


  app.post('/api/u/login', (req, res) => {
    if(req.body.loginName == undefined || req.body.loginPassword == undefined) {
      let response = {
        status: {
          code: 400,
          message: "Login info undefined"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
      return;
    }

    userAPI.login(pool, {'loginName':req.body.loginName, 'loginPassword':req.body.loginPassword}, (response) => {
      if (response.status.code == 200) {
        req.session.userID = response.data.userID;
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
      }
    });
  });


  //NOTE: REMOVE THIS. THIS IS ONLY FOR DEBUGGING !!!!!!!!!!!!!!!!!!
  app.post('/api/u/userInfo', (req, res) => {
    userAPI.getUserByReq(pool, req, (response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    });
  });

  app.post('/api/u/logout', (req, res) => {
    userAPI.getUserByReq(pool, req, (response) => {
      if (response.status.code == 200) {
        req.session.destroy();
        response = {
          status: {
            code: 200,
            message: 'Logged out'
          }
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
      } else if (response.status.code == 403) {
        req.session.destroy();
        response = {
          status: {
            code: 200,
            message: 'Already logged out'
          }
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
      }
    });
  });

}
