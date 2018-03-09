const userAPI = require('../apis/user');

module.exports = function(app, pool) {

  app.post('/api/u/getUser', (req, res) => {
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

    userAPI.findUserByID(pool, req.body.userID, (response) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
    })
  })


  app.post('/api/u/createUser', (req, res) => {
    if(req.body.userData == undefined){
      var response = {
        status: {
          code: 400,
          message: "User data undefined"
        }
      }
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
      return
    }

    var userData = JSON.parse(req.body.userData)
    userAPI.createUser(pool, userData, (response) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
    })
  })


  app.post('/api/u/deleteUser', (req, res) => {
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

    userAPI.deleteUser(pool, req.body.userID, (response) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
    })
  })


  app.post('/api/u/login', (req, res) => {
    if(req.body.loginName == undefined || req.body.loginPassword == undefined){
      var response = {
        status: {
          code: 400,
          message: "Login info undefined"
        }
      }
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
      return
    }

    userAPI.login(pool, {'loginName':req.body.loginName, 'loginPassword':req.body.loginPassword}, (response) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(response))
      return
    })
  })

}
