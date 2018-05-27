const randomstring = require('randomstring');
const bcrypt = require('bcrypt');
const permissions = require('./permissions');
const devnull = require('dev-null');
const sharp = require('sharp');
const streamToBuffer = require('stream-to-buffer');

module.exports.getUserByID = function (pool, userID, callback, returnPassword = false) {
  let query = 'SELECT id, email, fullName, groups, username, description FROM users WHERE id = $1';
  if (returnPassword) {
    query = 'SELECT id, email, fullName, groups, username, password, description FROM users WHERE id = $1';
  }
  pool.query(query, [userID], (err, qres) => {
    if (err) {
      let response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      };
      callback(response);
      throw err;
      return;
    }else if(qres.rows.length>0){
      let response = {
        status: {
          code: 200,
          message: "User found"
        },
        data: qres.rows[0]
      };
      callback(response);
    }else{
      let response = {
        status: {
          code: 204,
          message: "User not found"
        }
      };
      callback(response);
    }
  });
}

module.exports.getUserByLoginName = function (pool, loginName, callback, returnPassword = false) {
  let query = 'SELECT id, username, email, fullname, groups FROM users WHERE email = $1 OR username = $1';
  if (returnPassword) {
    query = 'SELECT id, username, email, fullname, groups, password FROM users WHERE email = $1 OR username = $1';
  }
  pool.query(query, [loginName], (err, qres) => {
    if (err) {
      let response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      };
      callback(response);
      throw err;
      return;
    }else if(qres.rows.length>0){
      let response = {
        status: {
          code: 200,
          message: "User found"
        },
        data: qres.rows[0]
      };
      callback(response);
    }else{
      let response = {
        status: {
          code: 204,
          message: "User not found"
        }
      };
      callback(response);
    }
  });
}

module.exports.createUser = function (pool, userData, callback) {
  function generateID() {
    let id = randomstring.generate(4);
    pool.query('SELECT id FROM users WHERE id = $1', [id], (err, qres) => {
      if(err) {
        let response = {
          status: {
            code: 500,
            message: "SQL error"
          },
          error: err
        };
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(response));
        return;
      }else if(qres){
        bcrypt.genSalt(12, function(err, salt) {
          bcrypt.hash(userData.password, salt, function(err, hash) {
            pool.query('INSERT INTO users(id, username, email, fullname, password, groups) VALUES ($1, $2, $3, $4, $5, $6)', [id, userData.username, userData.email, userData.fullname, hash, 'user'], (err, qres) => {
              if (err){
                if (err['detail'].includes('already exists')){
                  let response = {
                    status: {
                      code: 400,
                      message: "User already exists"
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
              }else{
                let response = {
                  status: {
                    code: 201,
                    message: "User created"
                  },
                  data: {
                    userID: id,
                    username: userData.username
                  }
                };
                callback(response);
              }
            });
          });
        });
      }else{
        generateID();
      }
    });
  }

  generateID();
}

module.exports.deleteUser = function(pool, userID, callback) {
  pool.query('DELETE FROM users WHERE id = $1', [userID], (err, qres) => {
    if (err){
      let response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      };
      callback(response);
    } else if (qres.rowCount == 0){
      let response = {
        status: {
          code: 204,
          message: "User not found"
        }
      };
      callback(response);
    }else if (qres.rowCount > 0){
      let response = {
        status: {
          code: 200,
          message: "User deleted"
        }
      };
      callback(response);
    }
  });
}

module.exports.login = function (pool, loginData, callback) {
  module.exports.getUserByLoginName(pool, loginData['loginName'], (user) => {
    if (user.status.code == 200) {
      bcrypt.compare(loginData['loginPassword'], user.data.password, function(err, res) {
        if (res) {
          permissions.checkGroupsPermission(pool, user.data.groups, 'canLogin', (perm) => {
            if (perm.status.code == 200) {
              if (perm.data.value == 1) {
                let response = {
                  status: {
                    code: 200,
                    message: "User authenticated"
                  },
                  data:{
                    userID: user.data.id,
                    username: user.data.username
                  }
                };
                callback(response);
                return;
              } else {
                let response = {
                  status: {
                    code: 403,
                    message: "Can not login"
                  },
                  data:{
                    userID: user.data.id
                  }
                };
                callback(response);
                return;
              }
            } else {
              let response = {
                status: {
                  code: 500,
                  message: 'Unknown internal error'
                },
                data: perm
              };
              callback(response);
            }
          })
        } else {
          let response = {
            status: {
              code: 204,
              message: "Credentials denied"
            }
          };
          callback(response);
        }
      });
    } else {
      let response = {
        status: {
          code: 204,
          message: "Credentials denied"
        }
      };
      callback(response);
    }
  }, true);
}
// PROBABLY WILL BE UNUSED
module.exports.getUserByReq = function (pool, reqst, callback) {
  if (reqst.session == undefined || reqst.session.userID == undefined) {
    let response = {
      status: {
        code: 403,
        message: "Not authenticated"
      }
    };
    callback(response);
    return;
  } else {
    module.exports.getUserByID(pool, reqst.session.userID, (response) => {
      callback(response);
    }, true);
  }
}

module.exports.isLoggedIn = function(req) {
  if (req.session.userID != undefined) {
    return true;
  }
  return false;
}

module.exports.checkUserPermission = function (pool, user, permission, callback) {
  if (user['groups'] != undefined) {
    permissions.checkGroupsPermission(pool, user['groups'], permission, (result) => {
      if (result.status.code == 200) {
        let response = {
          status: {
            code: 200,
            message: 'Permission'
          },
          data: result.data
        };
        callback(response);
      } else {
        callback(result);
      }
    });
  } else if (user['userID'] != undefined) {
    module.exports.getUserByID(pool, user['userID'], (userData) => {
      if (userData.status.code == 200) {
        permissions.checkGroupsPermission(pool, userData.data.groups, permission, (result) => {
          if (result.status.code == 200) {
            let response = {
              status: {
                code: 200,
                message: 'Permission'
              },
              data: result.data
            };
            callback(response);
          } else {
            callback(result);
          }
        });
      } else {
        callback(userData);
      }
    });
  } else {
    let response = {
      status: {
        code: 400,
        message: 'userID and groups are undefined'
      }
    };
    callback(response);
  }
}

module.exports.pushEdit = function (pool, data, callback) {
  pool.query('UPDATE users SET fullname = $2, description = $3 WHERE id = $1', [data.id, data.fullname, data.description], (err, qres) => {
    if (err) {
      let response = {
        status: {
          code: 500,
          message: 'SQL Error'
        }
      };
      callback(response);
    } else {
      let response = {
        status: {
          code: 200,
          message: 'User updated'
        }
      };
      callback(response);
    }
  });

  module.exports.uploadCancel = function (req, callback) {
    req.busboy.on('file', (field, file, filename) => {
      file.pipe(devnull());
    });

    req.busboy.on('finish', function(field){
      callback();
    });

    req.pipe(req.busboy);
  }
}

module.exports.uploadCover = (pool, fs, req, userID, callback) => {
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
              .resize(undefined, 1080)
              .jpeg({
                quality: 100
              })
              .toFile('./users/covers/' + userID + '.jpg')
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

    Promise.all([saveFile()]).then(function(values) {
      if (values[0] == 201) {
        let response = {
          status: {
            code: 201,
            message: "Cover uplaoded"
          }
        }
        callback(response);
      } else {
        let response = {
          status: {
            code: 500,
            message: "Unknown error occured"
          }
        }
        callback(response);
      }
    });

    req.pipe(req.busboy);
}

module.exports.uploadProfile = (pool, fs, req, userID, callback) => {
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
            .resize(1024, 1024)
            .crop(sharp.strategy.center)
            .jpeg({
              quality: 100
            })
            .toFile('./users/avatars/' + userID + '.jpg')
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

  Promise.all([saveFile()]).then((values) => {
    if (values[0] == 201) {
      let response = {
        status: {
          code: 201,
          message: "Profile photo uplaoded"
        }
      }
      callback(response);
    } else {
      let response = {
        status: {
          code: 500,
          message: "Unknown error occured"
        }
      }
      callback(response);
    }
  });

  req.pipe(req.busboy);
}
