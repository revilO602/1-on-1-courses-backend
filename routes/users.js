const express = require('express')
const {User} = require("../models/User");
const router = express.Router()
const {auth} = require("../middleware/authorization")
const extractUser = require("../middleware/extractUser"); // authentication middleware

// register new user
router.post('/register', async function (req, res) {
  try {
    await User.create(req.body)
    res.status(201).send()
  } catch (err) {
    const errObj = {};
    err.errors.map( er => {
      errObj[er.path] = er.message;
    })
    res.status(400).send(errObj);
  }
})

// user can check if his credentials are correct
// this will return 401 if wrong credentials in auth header
// used when the mobile app wants to save credentials or throw login error
router.post('/login', auth, extractUser, function (req, res) {
  res.status(200).send({id: req.user.id})
})

module.exports = router
