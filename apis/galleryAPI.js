const randomstring = require('randomstring');
const devnull = require('dev-null');
const sharp = require('sharp');
const streamToBuffer = require('stream-to-buffer');

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

module.exports.getArtworkList = function (pool, userAPI, user, callback) {
  let q;
  let prms;
  if (user != undefined) {
    prms = [user.id];
    if (user.session != undefined && user.id == user.session) {
      q = "SELECT id, owner, title, visibility, votes FROM artwork WHERE owner = $1 ORDER BY date DESC";
    } else {
      q = "SELECT id, owner, title, visibility, votes FROM artwork WHERE visibility = 1 AND owner = $1 ORDER BY date DESC";
    }
  } else {
    prms = [];
    q = "SELECT id, owner, title, visibility, votes FROM artwork WHERE visibility = 1 ORDER BY votes DESC LIMIT 10";
  }
  pool.query(q, prms, (err, qres) => {
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
      let order = {};
      qres.rows.forEach((a, i) => {
        order[a.id] = i;
      });
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
              artwork.data[order[row1.id]] = {
                id: row1.id,
                title: row1.title,
                ownerID: row1.owner,
                ownerName: user.data.username,
                visibility: row1.visibility,
                votes: row1.votes
              };
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

        function saveFile() {
          return new Promise((resolve, reject) => {
            req.busboy.on('file', (field, file, filename, encoding, mimetype) => {
              extension = '.' + filename.split('.').pop();
              type = mimetype.split('/')[0];
              if (mimetype.includes('image')) {
                streamToBuffer(file, function (err, buffer) {
                  sharp(buffer)
                  .withoutEnlargement(true)
                  .resize(undefined, 720)
                  .jpeg({
                    quality: 60
                  })
                  .toFile('./artwork/thumbs/' + id + '.jpg');

                  sharp(buffer)
                  .jpeg({
                    quality: 100
                  })
                  .toFile('./artwork/' + id + '.jpg')
                  .then((i) => {
                    resolve(201);
                  });
                });

              } else {
                file.pipe(devnull());
                errors = true;
                reject(500);
              }
            });
          });
        }


        req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
          if (val != undefined) {
            fields[fieldname] = val;
          } else {
            errors = true;
          }
        });

        function saveDB() {
          return new Promise((resolve, reject) => {
            req.busboy.on('finish', function(field){
              if (!errors) {
                let date  = new Date();
                pool.query('INSERT INTO artwork(id, type, owner, title, date, bgcolor, votes) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id, type, data[0], 'Untitled Artwork', date.toISOString(), 'eeeeee', 0], (err, qres) => {
                  if (err) {
                    if (err['detail'].includes('already exists')){
                      let response = 302;
                      resolve(response);
                    }else{
                      let response = 500;
                      resolve(response);
                    }
                  } else {
                    let response = 201;
                    resolve(response);
                  }
                });
              } else {
                let response = 400;
                resolve(response);
              }
            });
          });
        }

        Promise.all([saveFile(), saveDB()]).then(function(values) {
          if (values[0] == 201 && values[1] == 201) {
            let response = {
              status: {
                code: 201,
                message: "Artwork uplaoded"
              },
              id: id
            }
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

module.exports.deleteArtwork = function(pool, fs, artID, callback) {
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
      fs.unlink('./artwork/' + artID + '.jpg', (err) => {
        if (err) {
          let response = {
            status: {
              code: 500,
              message: "FS error"
            }
          };
          callback(response);
        } else {
          fs.unlink('./artwork/thumbs/' + artID + '.jpg', (err) => {
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

module.exports.searchArtwork = function (pool, userAPI, term, callback) {
  pool.query('SELECT * FROM artwork WHERE visibility = 1 AND title ilike $1 ORDER BY votes DESC', ['%'+term+'%'], (err, qres) => {
    if (err) {
      let response = {
        status: {
          code: 500,
          message: 'SQL error'
        },
        error: err
      };
      console.log(err);
      callback(response);
      return;
    } else if (qres.rows.length > 0) {
      let order = {};
      qres.rows.forEach((a, i) => {
        order[a.id] = i;
      });
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
              artwork.data[order[row1.id]] = {
                id: row1.id,
                title: row1.title,
                ownerID: row1.owner,
                ownerName: user.data.username,
                visibility: row1.visibility,
                votes: row1.votes
              };
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

module.exports.hasVoted = function(pool, artID, userID, callback) {
  module.exports.getArtwork(pool, artID, (art) => {
    if (art.status.code == 200) {
      if (art.data.votes_users.search(userID) == -1) {
        let response = {
          status: {
            code: 200,
            message: "Checked"
          },
          value: false
        };
        callback(response);
      } else {
        let response = {
          status: {
            code: 200,
            message: "Checked"
          },
          value: true
        };
        callback(response);
      }
    } else {
      callback(art);
    }
  });
}

module.exports.vote = function(pool, artID, userID, callback) {
  module.exports.getArtwork(pool, artID, (art) => {
    if (art.status.code == 200) {
      if (art.data.votes_users.search(userID) == -1) {
        pool.query('UPDATE artwork SET votes_users = $2, votes = $3 WHERE id = $1', [artID, art.data.votes_users + userID + ',', art.data.votes + 1], (err, qres) => {
          if (err) {
            let response = {
              status: {
                code: 500,
                message: "SQL Error"
              }
            };
            callback(response);
          } else {
            let response = {
              status: {
                code: 200,
                message: "Voted"
              },
              votes: art.data.votes + 1
            };
            callback(response);
          }
        });
      } else {
        let voters = art.data.votes_users.replace(userID+',', '');
        pool.query('UPDATE artwork SET votes_users = $2, votes = $3 WHERE id = $1', [artID, voters, art.data.votes - 1], (err, qres) => {
          if (err) {
            let response = {
              status: {
                code: 500,
                message: "SQL Error"
              }
            };
            callback(response);
          } else {
            let response = {
              status: {
                code: 200,
                message: "DeVoted"
              },
              votes: art.data.votes - 1
            };
            callback(response);
          }
        });
      }
    } else {
      callback(art);
    }
  });
}
