module.exports = function(app, pool, galleryAPI, fs, userAPI) {

  app.post('/api/g/getArtwork', (req, res) => {
    req.body.data = JSON.parse(req.body.data);
    galleryAPI.getArtwork(pool, req.body.data.id, (response) => {
      if (response.status.code == 200) {
        if (response.data.visibility == 0) {
          userAPI.getUserByReq(pool, req, (user) => {
            if (user.status.code == 200){
              if (response.data.owner != user.data.id) {
                response = {
                  status: {
                    code: 401,
                    message: "Unauthorized"
                  }
                };
              }
            } else {
              response = {
                status: {
                  code: 401,
                  message: "Unauthorized"
                }
              }
            }
          });
        }
      }
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    });
  });


  app.post('/api/g/upload', (req, res) => {
    userAPI.getUserByReq(pool, req, (response) => {
      if (response.status.code == 200) {
        userAPI.checkUserPermission(pool, {"groups": response.data.groups}, 'upload', (perm) => {
          if (perm.status.code == 200) {
            if (perm.data.value == 1) {
              galleryAPI.uploadArtwork(pool, fs, req, [response.data.id], (response) => {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(response));
              });
            } else {
              galleryAPI.uploadCancel(req, () => {
                let response = {
                  status: {
                    code: 403,
                    message: "Permission denied"
                  }
                };
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(response));
              });
            }
          } else {
            galleryAPI.uploadCancel(req, () => {
              let response = {
                status: {
                  code: 500,
                  message: "Unknown error"
                }
              };
              res.setHeader('Content-Type', 'application/json');
              res.send(JSON.stringify(response));
            });
          }
        });
      } else if (response.status.code == 403) {
        galleryAPI.uploadCancel(req, () => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));;
        });
      } else {
        galleryAPI.uploadCancel(req, () => {
          let response = {
            status: {
              code: 500,
              message: 'Unknown internal error'
            }
          };
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        });
      }
    });
  });

  app.post('/api/g/deleteArtwork', (req, res) => {
    if (req.body.artID != undefined) {
      userAPI.getUserByReq(pool, req, (user) => {
        if (user.status.code == 200) {
          galleryAPI.getArtwork(pool, req.body.artID, (art) => {
            if (art.status.code == 200) {
              if (art.data.owner == user.data.id) {
                galleryAPI.deleteArtwork(pool, fs, art.data.id, (response) => {
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
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.send(JSON.stringify(art));
            }
          });
        } else {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(user));
        }
      });
    } else {
      let response = {
        status: {
          code: 400,
          message: "artID undefined"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    }
  });

  app.post('/api/g/getArtworkList', (req, res) => {
    galleryAPI.getArtworkList(pool, userAPI, undefined, (response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    });
  });

  app.post('/api/g/getUserArtworkList', (req, res) => {
    if (req.body['userID'] != undefined) {
      galleryAPI.getArtworkList(pool, userAPI, req.body['userID'], (response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
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

  app.post('/api/g/editForm', (req, res) => {
    galleryAPI.getArtwork(pool, req.body.artID, (response) => {
      if (response.status.code == 200) {
        let artwork = {
          "id": response.data.id,
          "path": '/artwork/' + response.data.filename,
          "title": response.data.title,
          "date": response.data.date,
          "ownerName": "",
          "ownerID": response.data.owner,
          "votes": response.data.votes,
          "bgColor": response.data.bgcolor
        };
        res.render('gallery/editForm.ejs', {artwork});
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
      }
    });
  });

  app.post('/api/g/edit', (req, res) => {
    galleryAPI.canEdit(pool, req, req.body['artID'], userAPI, (resp) => {
      if (resp === true) {
        let data = {
          id: req.body['artID'],
          title: req.body['title'],
          description: req.body['description'],
          bgColor: req.body['bgColor']
        };
        galleryAPI.pushEdit(pool, data, (response) => {
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
  });

  app.post('/api/g/search', (req, res) => {
    if (req.body.query == undefined) {
      let response = {
        status: {
          code: 400,
          message: "Bad request"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
      return;
    }
    galleryAPI.searchArtwork(pool, userAPI, req.body.query, (response) => {
      if (response.status.code == 200 || response.status.code == 204) {
        if (response.status.code == 204) response.data = {};
        res.render('gallery/search', {artwork: response.data});
      } else {
        res.send('500');
      }
    });
  });

  app.post('/api/g/vote', (req, res) => {
    if (req.body.artID == undefined) {
      let response = {
        status: {
          code: 400,
          message: "Bad request"
        }
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
      return;
    }
    userAPI.getUserByReq(pool, req, (user) => {
      if (user.status.code == 200) {
        galleryAPI.vote(pool, req.body.artID, user.data.id, (response) => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        });
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(user));
      }
    });

  });
}
