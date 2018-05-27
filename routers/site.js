const path = require('path');
module.exports = function(app, pool, fs) {

  app.get('/users/avatar/:userID', (req, res) => {
    res.sendFile(path.join(__dirname, '../users/avatars/'+req.params.userID+'.jpg'), (err) => {
      if (err) {
        res.sendFile(path.join(__dirname, '../users/defaultAvatar.png'));
      }
    });
  });

  app.get('/users/cover/:userID', (req, res) => {
    res.sendFile(path.join(__dirname, '../users/covers/'+req.params.userID+'.jpg'), (err) => {
      if (err) {
        res.status(404).send('404');
      }
    });
  });

}
