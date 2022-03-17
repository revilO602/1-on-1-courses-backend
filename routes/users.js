const express = require('express')
const {User} = require("../models/User");
const router = express.Router()

router.post('/register', function (req, res) {
  User.create(req.body).catch(err => {
    res.status(400).send({
      message:
        err.message || "Some error occurred while creating user."
    });
  }).then(data => res.status(201).send(data));

})

router.post('/login', function (req, res) {
  res.status(200).send('You passed')
})

module.exports = router
