const express = require('express')
const {User} = require("../models/User");
const {Course} = require("../models/Course");
const router = express.Router()
const {auth} = require("../middleware/authorization")

router.use(auth)

router.post('/', function (req, res) {
    Course.create(req.body).catch(err => {
      res.status(400).send({
        message:
          err.message || "Some error occurred while creating course."
      });
    }).then(data => res.status(201).send(data));
})

module.exports = router
