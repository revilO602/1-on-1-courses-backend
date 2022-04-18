const {User} = require("../models/User");

function extractUser(req, res, next) {
  console.log('hello')
  User.findOne({ where: { email: req.auth.user } }).catch(err =>{
    res.status(400).send(err.message)
  }).then(userObj => {
    req.user = userObj;
    next()
  })
}

module.exports = extractUser
