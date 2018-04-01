const async = require('async');

module.exports.getGroup = function (pool, groupName, callback) {
  pool.query('SELECT * FROM permgroups WHERE name = $1', [groupName], (err, qres) => {
    if (err) {
      let response = {
        status: {
          code: 500,
          message: "SQL error"
        }
      }
      callback(response)
      throw err
      return
    }else if(qres.rows.length>0){
      let response = {
        status: {
          code: 200,
          message: "Group found"
        },
        data: qres.rows[0]
      }
      callback(response)
    }else{
      let response = {
        status: {
          code: 204,
          message: "Group not found"
        }
      }
      callback(response)
    }
  })
}

module.exports.getGroupPermission = function (pool, groupName, permission, callback) {
  module.exports.getGroup(pool, groupName, (group) => {
    if (group.status.code == 200) {
      group.data.permissions = JSON.parse(group.data.permissions)
      if (group.data.permissions[permission] != undefined) {
        let response = {
          status: {
            code: 200,
            message: "Permission found"
          },
          data: {
            name: permission,
            value: group.data.permissions[permission],
            priority: group.data.priority
          }
        }
        callback(response)
      } else {
        let response = {
          status: {
            code: 204,
            message: "Permission not found"
          }
        }
        callback(response)
      }
    } else {
      callback(group)
    }
  })
}

module.exports.checkUserPermission = function (pool, userGroups, permission, callback) {
  userGroups = userGroups.split(',')
  let permResult = 0
  let permGroup = ''
  let permPriority = -1
  async.forEachOf(userGroups, (group, key, callback) =>{
    module.exports.getGroupPermission(pool, group, permission, (perm) => {
      if (perm.status.code == 200) {
        if (perm.data.priority > permPriority) {
          permResult = perm.data.value
          permGroup = group
          permPriority = perm.data.priority
        }
      } else if (perm.status.code == 204) {
      } else {
        //ERR
      }
      callback()
    })
  }, (err) => {
    if (err) {
      let response = {
        status: {
          code: 500,
          message: 'Unknown internal error'
        }
      }
      console.log(err)
      callback(response)
    } else {
      let response = {
        status: {
          code: 200,
          message: 'Permission'
        },
        data: {
          name: permission,
          group: permGroup,
          value: permResult,
          priority: permPriority
        }
      }
      callback(response)
    }
  })
}
