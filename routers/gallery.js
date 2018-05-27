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
        userAPI.getUserByID(pool, response.data.owner, (user) => {
          artwork.ownerName = user.data.username;
          userAPI.getUserByReq(pool, req, (usr) => {
            let voted = false;
            if (usr.status.code == 200) {
              let userID = usr.data.id;
              galleryAPI.hasVoted(pool, req.params['artID'], userID, (vote) => {
                if (vote.status.code == 200 && vote.value == true) {
                  voted = true;
                  res.render('gallery/art', {artwork, userID, voted});
                } else {
                  res.render('gallery/art', {artwork, userID, voted});
                }
              });
            } else {
              let userID = "0"
              res.render('gallery/art', {artwork, userID, voted});
            }
          });
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
