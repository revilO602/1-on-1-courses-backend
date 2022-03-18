const express = require('express')
const {User} = require("../models/User");
const {Timeslot} = require("../models/Timeslot");
const {Course} = require("../models/Course");
const router = express.Router()
const {auth} = require("../middleware/authorization")
const {CourseCategory} = require("../models/CourseCategory");
const extractUser = require("../middleware/extractUser");

router.use(auth)

// list categories
router.get('/categories', function (req, res) {
  CourseCategory.findAll({attributes: ['id', 'name'], order: [['name', 'ASC']]}).catch(err => {
    console.log(err)
    res.status(404).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }).then(data => res.status(200).send(data));
})

router.get('/:id', function (req, res) {
  Course.create(req.body).catch(err => {
    res.status(400).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }).then(data => res.status(201).send(data));
})

router.post('/:id', function (req, res) {
    Course.create(req.body).catch(err => {
      res.status(400).send({
        message:
          err.message || "Some error occurred while creating course."
      });
    }).then(data => res.status(201).send(data));
})

router.put('/:id', function (req, res) {
  Course.create(req.body).catch(err => {
    res.status(400).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }).then(data => res.status(201).send(data));
})

router.get('/', async function (req, res) {
  const courses = await Course.findAll({include: Timeslot})
  res.status(200).send(courses)
})

router.post('/', extractUser, async function (req, res) {
  const timeslots = req.body["timeslots"]
  let buildTimeslots = []
  if (!Array.isArray(timeslots) || !timeslots.length){
    res.status(400).send({message: "Missing the timeslots array"})
  }
  try{
    for (const timeslot of timeslots) {
      let timeslotObj = await Timeslot.build(timeslot)
      buildTimeslots.push(timeslotObj)
    }
    const course = await Course.create({...req.body, teacher_id: req.user.id})
    for (const timeslot of buildTimeslots) {
      timeslot.courseId = course.id
      await timeslot.save()
    }
    res.status(201).send({course, timeslots: buildTimeslots})
  } catch (err){
    res.status(400).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }
})

module.exports = router
