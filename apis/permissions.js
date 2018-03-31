let permissions = {
  'canLogin': 1
}

module.exports.getPermission = function(name) {
  if (permissions[name] == undefined) {
    console.error('Permission not found: ', name);
    return false
  } else {
    return permissions[name]
  }
};

module.exports.checkPermission = function(value, name) {
  let num = module.exports.getPermission(name)
  if (num == false) return false
  if ((value & num) == num) {
    return true
  } else return false
}
