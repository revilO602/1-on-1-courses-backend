const express = require('express')
const {User} = require("../models/User");
const {Timeslot} = require("../models/Timeslot");
const {Course} = require("../models/Course");
const router = express.Router()
const {auth} = require("../middleware/authorization")
const {CourseCategory} = require("../models/CourseCategory");
const extractUser = require("../middleware/extractUser");

router.use(auth) // use auth for every route

//get course detail
router.get('/courses/:courseId', extractUser, async function (req, res) {
  try {
    let courseObj = await Course.findByPk(req.params.courseId, {
      include: [
        {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
        {model: CourseCategory, as: 'category', attributes: ['name']},
        {
          model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
          include: {model: User, as: 'student', attributes: ['firstName', 'lastName']}
        }
      ]
    })
    if (!courseObj) {
      res.status(404).send({message: 'Course with given ID does not exist'})
    } else if (courseObj.teacherId !== req.user.id){
      res.status(403).send({message: 'You are not a teacher of this course'})
    } else {
      res.status(200).send(courseObj)
    }
  } catch (e){
    res.status(400).send({
      message:
        e.message || "Some error occurred while creating course."
    });
  }
})

// list teacher courses
router.get('/courses', extractUser, async function (req, res) {
  const options = {where: {teacherId: req.user.id}, order: [['name', 'ASC']], include: [
      {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
      {model: CourseCategory, as: 'category', attributes: ['name']},
    ]}
  const courses = await Course.findAll(options)
  res.status(200).send(courses)
})

module.exports = router
