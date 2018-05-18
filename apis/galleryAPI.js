const randomstring = require('randomstring');
const devnull = require('dev-null');

module.exports.getArtwork = function (pool, id, callback) {
  pool.query("SELECT * FROM artwork WHERE id = $1", [id], (err, qres) => {
    if (err) {
      let response = {
        status: {
          code: 500,
          message: 'SQL error'
        },
        error: err
      };
      callback(response);
      return;
    } else if (qres.rows.length > 0) {
      let response = {
        status: {
          code: 200,
          message: 'Artwork found'
        },
        data: qres.rows[0]
      };
      callback(response);
      return;
    } else {
      let response = {
        status: {
          code: 204,
          message: 'Artwork not found'
        }
      };
      callback(response);
      return;
    }
  });
}

module.exports.getArtworkList = function (pool, userAPI, callback) {
    pool.query("SELECT id, owner, title, filename FROM artwork WHERE visibility = 1 ORDER BY votes DESC LIMIT 10", [], (err, qres) => {
      if (err) {
        let response = {
          status: {
            code: 500,
            message: 'SQL error'
          },
          error: err
        };
        callback(response);
        return;
      } else if (qres.rows.length > 0) {
        let artwork = {
          status: {
            code: 200,
            message: "Artwork found"
          },
          data: []
        };

        function rowToArtwork(row1) {
          return new Promise((resolve, reject) => {
            userAPI.getUserByID(pool, row1.owner, (user) => {
              if (user.status.code == 200) {
                artwork.data.push({
                  id: row1.id,
                  title: row1.title,
                  ownerID: row1.owner,
                  ownerName: user.data.username,
                  path: '/artwork/' + row1.filename
                });
                resolve();
              } else {
                reject(user);
              }
            });
          });
        }

        function done() {
          callback(artwork);
        }

        Promise.all(qres.rows.map(rowToArtwork)).then(done);
      } else {
        let response = {
          status: {
            code: 204,
            message: 'No artwork found'
          }
        };
        callback(response);
        return;
      }
    });
}

module.exports.uploadArtwork = (pool, fs, req, data, callback) => {
  function upload() {
    let id = randomstring.generate(6);
    pool.query('SELECT * FROM artwork WHERE id = $1', [id], (err, qres) => {
      if (err) {
        let response = {
          status: {
            code: 500,
            message: 'SQL error'
          },
          error: err
        };
        callback(response);
      } else if (qres) {
        let extension, type, fields = {}, errors = false;
        req.busboy.on('file', (field, file, filename, encoding, mimetype) => {
          extension = '.' + filename.split('.').pop();
          type = mimetype.split('/')[0];
          if (mimetype.includes('image')) {
            file.pipe(fs.createWriteStream('./artwork/' + id + extension));
          } else {
            file.pipe(devnull());
            errors = true;
          }
          //
        });

        req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
          if (val != undefined) {
            fields[fieldname] = val;
          } else {
            errors = true;
          }
        });

        req.busboy.on('finish', function(field){
          if (!errors) {
            let date  = new Date();
            pool.query('INSERT INTO artwork(id, type, filename, owner, title, date, votes, bgcolor) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [id, type, id + extension, data[0], '{{TEMP TITLE}}', date.toISOString(), 0, 'eeeeee'], (err, qres) => {
              if (err) {
                console.log(err);
                if (err['detail'].includes('already exists')){
                  let response = {
                    status: {
                      code: 400,
                      message: "Artwork already exists"
                    }
                  };
                  callback(response);
                }else{
                  let response = {
                    status: {
                      code: 500,
                      message: "SQL error"
                    }
                  };
                  callback(response);
                }
              } else {
                let response = {
                  status: {
                    code: 201,
                    message: 'File uploaded'
                  },
                  id: id
                };
                callback(response);
              }
            });
          } else {
            let response = {
              status: {
                code: 400,
                message: "Request error"
              }
            };
            callback(response);
          }
        });

        req.pipe(req.busboy);
      } else {
        upload();
      }
    });
  }

  upload();
}

module.exports.uploadCancel = function (req, callback) {
  req.busboy.on('file', (field, file, filename) => {
    file.pipe(devnull());
  });

  req.busboy.on('finish', function(field){
    callback();
  });

  req.pipe(req.busboy);
}

module.exports.deleteArtwork = function(pool, fs, artID, path, callback) {
  pool.query('DELETE FROM artwork WHERE id = $1', [artID], (err, qres) => {
    if (err) {
      let response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      };
      callback(response);
    } else {
      fs.unlink('./artwork/' + path, (err) => {
        if (err) {
          let response = {
            status: {
              code: 500,
              message: "FS error"
            }
          };
          callback(response);
        } else {
          let response = {
            status: {
              code: 200,
              message: "Deleted"
            }
          };
          callback(response);
        }
      });
    }
  });
}

module.exports.canView = function (pool, req, artID, userAPI, callback) {
  module.exports.getArtwork(pool, artID, (art) => {
    if (response.status.code == 200) {
      if (art.data.visibility == 1) {
        return true;
      } else {
        userAPI.getUserByReq(pool, req, (user) => {
          if (user.status.code == 200) {
            if (user.data.id == art.data.owner) {
              callback(true);
            } else callback(false);
          } else callback(false);
        });
      }
    } else callback(false);
  });
}

module.exports.canEdit = function (pool, req, artID, userAPI, callback) {
  module.exports.getArtwork(pool, artID, (art) => {
    if (art.status.code == 200) {
      userAPI.getUserByReq(pool, req, (user) => {
        if (user.status.code == 200) {
          if (user.data.id == art.data.owner) {
            callback(true);
          } else callback(false);
        } else callback(false);
      });
    } else callback(false);
  });

  module.exports.pushEdit = function (pool, data, callback) {
    pool.query("UPDATE artwork SET title = $2, bgcolor = $3, description = $4, visibility = $5 WHERE id = $1", [data.id, data.title, data.bgColor, data.description, 1], (err, qres) => {
      if (err) {
        let response = {
          status: {
            code: 500,
            message: 'SQL error'
          }
        };
        callback(response);
      } else {
        let response = {
          status: {
            code: 200,
            message: 'Post updated'
          }
        };
        callback(response);
      }
    });
  }
}
