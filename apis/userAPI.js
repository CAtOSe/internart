const randomstring = require('randomstring');
const permissions = require('./permissions');

module.exports.getUserByID = function (pool, userID, callback, returnPassword = false) {
  let query = 'SELECT id, email, fullName, groups, username FROM users WHERE id = $1';
  if (returnPassword) {
    query = 'SELECT id, email, fullName, groups, username, password FROM users WHERE id = $1';
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
        pool.query('INSERT INTO users(id, username, email, fullname, password, groups) VALUES ($1, $2, $3, $4, $5, $6)', [id, userData['username'], userData['email'], userData['fullName'], userData['password'], userData['groups']], (err, qres) => {
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
              data: {userID: id}
            };
            callback(response);
          }
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
      if (user.data.password == loginData['loginPassword']) {
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
        callback(response);
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
