var args = process.argv.slice(2);
var express = require('express')
var randomstring = require('randomstring')
var passport = require('passport')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var flash = require('connect-flash')
var router = express.Router()

const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  host: args[0],
  password: args[1],
  database: 'test',
  port: '5432'
})

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})


router.post('/api/u/getUser', (req, res) => {
  if(req.body.userID == undefined){
    var response = {
      status: {
        code: 400,
        message: "UserID undefined"
      }
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(response))
    return
  }

  pool.query('SELECT id, username, fullname, access FROM users WHERE id = $1', [req.body.userID], (err, qres) => {
    if (err) {
      var response = {
        status: {
          code: 500,
          message: "SQL error"
        },
        error: err
      }
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
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
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
    }else{
        var response = {
          status: {
            code: 204,
            message: "User not found"
          }
        }
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
    }
  })
})

router.post('/api/u/createUser', (req, res) => {
  if(req.body.userData == undefined){
    var response = {
      status: {
        code: 400,
        message: "user data undefined"
      }
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(response))
    return
  }

  function generateID() {
    var id = randomstring.generate(4)
    pool.query('SELECT id FROM users WHERE id = $1', [id], (err, qres) => {
      if(err) {
        var response = {
          status: {
            code: 500,
            message: "SQL error"
          }
        }
        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(response))
        return
      }else if(qres){
        var userData = JSON.parse(req.body.userData)
        pool.query('INSERT INTO users(id, username, fullname, password, access) VALUES ($1, $2, $3, $4, $5)', [id, userData['username'], userData['fullname'], userData['password'], userData['access']], (err, qres) => {
          if (err){
            if (err['detail'].includes('already exists')){
              var response = {
                status: {
                  code: 400,
                  message: "User already exists"
                }
              }
              res.setHeader('Content-Type', 'application/json')
              res.send(JSON.stringify(response))

            }else{
              var response = {
                status: {
                  code: 500,
                  message: "SQL error"
                }
              }
              res.setHeader('Content-Type', 'application/json')
              res.send(JSON.stringify(response))
            }
          }else{
            var response = {
              status: {
                code: 201,
                message: "User created"
              },
              data: {userID: id}
            }
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(response))

          }
        })
      }else{
        generateID()
      }
    })
  }

  generateID()
})

router.post('/api/u/deleteUser', (req, res) => {
  if(req.body.userID == undefined){
    var response = {
      status: {
        code: 400,
        message: "userID undefined"
      }
    }
    res.setHeader('Content-Type', 'application/json')
    res.send(JSON.stringify(response))
    return
  }
  pool.query('DELETE FROM users WHERE id = $1', [req.body.userID], (err, qres) => {
    if (err){
      var response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      }
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
    } else if (qres.rowCount == 0){
      var response = {
        status: {
          code: 204,
          message: "User not found"
        }
      }
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
    }else if (qres.rowCount > 0){
      var response = {
        status: {
          code: 200,
          message: "User deleted"
        }
      }
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
    }
  })
})

router.post('u/login', (req, res) => {
  if(req.body.loginName == undefined || req.body.loginPassword == undefined){
    
  }
})

module.exports = router
