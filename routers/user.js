var args = process.argv.slice(2);
var express = require('express')
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

router.all('/u/:userID',(req,res)=>{
  pool.query('SELECT * FROM users WHERE id = $1', [req.params['userID']], (err, qres) => {
    if (err) {
      throw err
    }

    var user = {
      username: qres.rows[0]['username'],
      fullname: qres.rows[0]['fullname'],
      id: req.params['userID']
    }

    res.render('user/user', {user: user})
  })
})

module.exports = router
