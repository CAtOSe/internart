module.exports = function(app, pool, galleryAPI, userAPI) {

  app.get('/', (req, res) => {
    galleryAPI.getArtworkList(pool, userAPI, undefined, (response) => {
      if (response.status.code == 200) {
        res.render('gallery/main', {"artwork": response.data});
      } else {
        res.render('gallery/main', {"artwork": false});
      }
    });
  });

  app.get('/art/:artID', (req, res) => {
    galleryAPI.getArtwork(pool, req.params['artID'], (response) => {
      if (response.status.code == 200) {
        let artwork = {
          "id": response.data.id,
          "title": response.data.title,
          "description": response.data.description,
          "date": response.data.date,
          "ownerName": "",
          "ownerID": response.data.owner,
          "votes": response.data.votes,
          "bgColor": response.data.bgcolor
        };

        function getOwnerName() {
          return new Promise((resolve, reject) => {
            userAPI.getUserByID(pool, response.data.owner, (user) => {
              if (user.status.code == 200) {
                artwork.ownerName = user.data.username;
              } else {
                artwork.ownerName = 'Anonymous';
              }
              resolve();
            });
          });
        }

        let userID;
        let voted = false;
        let adminTools = false;
        function setAdminTools(val) { adminTools = val; }
        function checkUser() {
          return new Promise((resolve, reject) => {
            userAPI.getUserByReq(pool, req, (user) => {
              if (user.status.code == 200) {
                userID = user.data.id;

                function hasVoted() {
                  return new Promise((resolve1, reject1) => {
                    galleryAPI.hasVoted(pool, artwork.id, userID, (vote) => {
                      voted = vote.value;
                      resolve1();
                    });
                  });
                }

                function adminTools() {
                  return new Promise((resolve1, reject1) => {
                    userAPI.checkUserPermission(pool, {groups: user.data.groups}, 'adminTools', (perm) => {
                      if (perm.status.code == 200 && perm.data.value == 1) {
                        setAdminTools(true);
                      }
                      resolve1();
                    });
                  });
                }

                Promise.all([hasVoted(), adminTools()]).then(() => {
                  resolve();
                });

              } else resolve();
            });
          });
        }

        Promise.all([getOwnerName(), checkUser()]).then(() => {
          res.render('gallery/art', {artwork, userID, voted, adminTools});
        });
      } else {
        res.render('404');
      }
    });
  });

  app.get('/upload', (req, res) => {
    userAPI.getUserByReq(pool, req, (user) => {
      if (user.status.code == 200) {
        userAPI.checkUserPermission (pool, {'groups': user.data.groups}, 'upload', (perm) => {
          if (perm.status.code == 200) {
            if (perm.data.value == 1) {
              res.render('gallery/upload');
            } else {
              // ACCESS DENIED PAGE
              res.redirect('/');
            }
          } else {
            // SOME ERROR PAGE
            res.redirect('/');
          }
        });

      } else {
        res.redirect('/login');
      }
    });
  });

  app.get('/edit/:artID', (req, res) => {
    galleryAPI.canEdit(pool, req, req.params['artID'], userAPI, (resp) => {
      if (resp === true) {
        galleryAPI.getArtwork(pool, req.params['artID'], (response) => {
          if (response.status.code == 200) {
            let artwork = {
              "id": response.data.id,
              "title": response.data.title,
              "description": response.data.description,
              "date": response.data.date,
              "ownerName": "",
              "ownerID": response.data.owner,
              "votes": response.data.votes,
              "bgColor": response.data.bgcolor
            };
            userAPI.getUserByID(pool, response.data.owner, (user) => {
              artwork.ownerName = user.data.username;
              res.render('gallery/edit', {artwork});
            });
          } else {
            res.render('404');
          }
        });
      } else {
        res.redirect('/art/' + req.params['artID']);
      }
    });
  });

}
