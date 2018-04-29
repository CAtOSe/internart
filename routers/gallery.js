module.exports = function(app, pool, galleryAPI, userAPI) {

  app.get('/', (req, res) => {
    galleryAPI.getArtworkList(pool, userAPI, (response) => {
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
          "path": '/artwork/' + response.data.filename,
          "title": response.data.title,
          "date": response.data.date,
          "ownerName": "",
          "ownerID": response.data.owner,
          "votes": response.data.votes
        };
        userAPI.getUserByID(pool, response.data.owner, (user) => {
          artwork.ownerName = user.data.username;
          res.render('gallery/art', {artwork});
        });
      } else {
        res.render('404');
      }
    });
  });

  app.get('/gallery/upload', (req, res) => {
    res.render('gallery/upload');
  });

}
