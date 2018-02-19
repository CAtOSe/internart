const randomstring = require('randomstring')

module.exports.findUserByID = function (pool, userID, callback, returnPassword = false) {
  var query = 'SELECT id, email, fullname, access FROM users WHERE id = $1'
  if (returnPassword) {
    query = 'SELECT id, email, fullname, access, password FROM users WHERE id = $1'
  }
  pool.query(query, [userID], (err, qres) => {
    if (err) {
      var response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      }
      callback(response)
      throw err
      return
    }else if(qres.rows.length>0){
      var response = {
        status: {
          code: 200,
          message: "User found"
        },
        data: qres.rows[0]
      }
      callback(response)
    }else{
      var response = {
        status: {
          code: 204,
          message: "User not found"
        }
      }
      callback(response)
    }
  })
}

module.exports.findUserByLoginName = function (pool, loginName, callback, returnPassword = false) {
  var query = 'SELECT id, email, fullname, access FROM users WHERE id = $1'
  if (returnPassword) {
    query = 'SELECT id, email, fullname, access, password FROM users WHERE id = $1'
  }
  pool.query(query, [loginName], (err, qres) => {
    if (err) {
      var response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      }
      callback(response)
      throw err
      return
    }else if(qres.rows.length>0){
      var response = {
        status: {
          code: 200,
          message: "User found"
        },
        data: qres.rows[0]
      }
      callback(response)
    }else{
      var response = {
        status: {
          code: 204,
          message: "User not found"
        }
      }
      callback(response)
    }
  })
}

module.exports.createUser = function (pool, userData, callback) {
  function generateID() {
    var id = randomstring.generate(4)
    pool.query('SELECT id FROM users WHERE id = $1', [id], (err, qres) => {
      if(err) {
        var response = {
          status: {
            code: 500,
            message: "SQL error"
          },
          error: err
        }
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(response))
        return
      }else if(qres){
        pool.query('INSERT INTO users(id, email, fullname, password, access) VALUES ($1, $2, $3, $4, $5)', [id, userData['email'], userData['fullname'], userData['password'], userData['access']], (err, qres) => {
          if (err){
            if (err['detail'].includes('already exists')){
              var response = {
                status: {
                  code: 400,
                  message: "User already exists"
                }
              }
              callback(response)
            }else{
              var response = {
                status: {
                  code: 500,
                  message: "SQL error"
                }
              }
              callback(response)
            }
          }else{
            var response = {
              status: {
                code: 201,
                message: "User created"
              },
              data: {userID: id}
            }
            callback(response)
          }
        })
      }else{
        generateID()
      }
    })
  }

  generateID()
}

module.exports.deleteUser = function(pool, userID, callback) {
  pool.query('DELETE FROM users WHERE id = $1', [userID], (err, qres) => {
    if (err){
      var response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      }
      callback(response)
    } else if (qres.rowCount == 0){
      var response = {
        status: {
          code: 204,
          message: "User not found"
        }
      }
      callback(response)
    }else if (qres.rowCount > 0){
      var response = {
        status: {
          code: 200,
          message: "User deleted"
        }
      }
      callback(response)
    }
  })
}
