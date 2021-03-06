module.exports = function(app, pool, userAPI, fs) {

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
    if(req.body == undefined){
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
    userAPI.createUser(pool, req.body, (response) => {
      if (response.status.code == 201) {
        req.session.userID = response.data.userID;
        res.cookie('username', response.data.username);
        res.cookie('id', response.data.userID);
      }
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
        res.cookie('username', response.data.username);
        res.cookie('id', response.data.userID);
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
        res.clearCookie('username');
        res.clearCookie('id');
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
        res.clearCookie('username');
        res.clearCookie('id');
        response = {
          status: {
            code: 403,
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

  app.post('/api/u/checkPermission', (req, res) => {
    if (req.body['userID'] != undefined && req.body['permission'] != undefined) {
      userAPI.checkUserPermission(pool, {userID: req.body['userID']}, req.body['permission'], (response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
      });
    } else {
      let response = {
        status: {
          code: 400,
          message: "Request info undefined"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    }
  });

  app.post('/api/u/editForm', (req, res) => {
    userAPI.getUserByReq(pool, req, (user) => {
      if (user.status.code == 200) {
        res.render('user/editForm', {
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
  });

  app.post('/api/u/edit', (req, res) => {
    if (req.body.id != undefined && req.body.fullname != undefined && req.body.description != undefined) {
      userAPI.getUserByReq(pool, req, (user) => {
        if (user.status.code == 200 && user.data.id == req.body.id) {
          let data = {
            id: req.body.id,
            fullname: req.body.fullname,
            description: req.body.description
          };
          userAPI.pushEdit(pool, data, (response) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(response));
          });
        } else {
          let response = {
            status: {
              code: 401,
              message: "Unauthorized"
            }
          };
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        }
      });
    } else {
      let response = {
        status: {
          code: 400,
          message: "Bad request"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    }
  });

  app.post('/api/u/upload-cover/:userID', (req, res) => {
    userAPI.getUserByReq(pool, req, (user) => {
      if (user.status.code == 200 && user.data.id == req.params.userID) {
        userAPI.uploadCover(pool, fs, req, user.data.id, (response) => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        });
      } else {
        userAPI.uploadCancel(req, () => {
          let response = {
            status: {
              code: 403,
              message: "Unauthorized"
            }
          };
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        });
      }
    });
  });

  app.post('/api/u/upload-profile/:userID', (req, res) => {
    userAPI.getUserByReq(pool, req, (user) => {
      if (user.status.code == 200 && user.data.id == req.params.userID) {
        userAPI.uploadProfile(pool, fs, req, user.data.id, (response) => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        });
      } else {
        userAPI.uploadCancel(req, () => {
          let response = {
            status: {
              code: 403,
              message: "Unauthorized"
            }
          };
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        });
      }
    });
  });

}
