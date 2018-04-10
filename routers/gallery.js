module.exports = function(app, pool, galleryAPI, fs, userAPI) {

  app.post('/api/g/getArtwork', (req, res) => {
    req.body.data = JSON.parse(req.body.data);
    galleryAPI.getArtwork(pool, req.body.data.id, (response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(response));
    });
  });


  app.post('/api/g/upload', (req, res) => {
    userAPI.getUserByReq(pool, req, (response) => {
      if (response.status.code == 200){
        galleryAPI.uploadArtwork(pool, fs, req, [response.data.id], (response) => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));
        });
      } else if (response.status.code == 403) {
        galleryAPI.uploadCancel(req, () => {
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));;
        });
      } else {
        console.log(response.status.code);
        galleryAPI.uploadCancel(req, () => {
          let response = {
            status: {
              code: 500,
              message: 'Unknown internal error'
            }
          };
          res.setHeader('Content-Type', 'application/json');
          res.send(JSON.stringify(response));;
        });
      }
    });
  });
}
