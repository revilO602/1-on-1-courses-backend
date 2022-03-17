const {User} = require('../models/User')
const basicAuth = require("express-basic-auth"); // authorization middleware
const auth = basicAuth( { authorizer: credentialsAuthorizer, authorizeAsync: true })

async function credentialsAuthorizer(username, password, cb) {
  const user = await User.findOne({ where: { email: username, password: password } }).catch(err =>{
    console.log(err.message)
    return cb(null, false)
  });
  if (user === null){
    return cb(null, false)
  }
  else{
    return cb(null, true)
  }
}

module.exports = {
  auth: auth,
}
