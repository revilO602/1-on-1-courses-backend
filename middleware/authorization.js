const User = require('../models/User')

async function credentialsAuthorizer(username, password, cb) {
  const user = await User.findOne({ where: { username: username, password: password } });
  if (user === null){
    return cb(null, false)
  }
  else{
    return cb(null, true)
  }
}

module.exports = {
  credentialsAuthorizer: credentialsAuthorizer,
}
