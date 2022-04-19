const express = require('express')
const {User} = require("../models/User");
const {Timeslot} = require("../models/Timeslot");
const {Course} = require("../models/Course");
const router = express.Router()
const {auth} = require("../middleware/authorization")
const {CourseCategory} = require("../models/CourseCategory");
const extractUser = require("../middleware/extractUser");
const handleError = require("../helpers/errorHandler");

router.use(auth) // use auth for every route

//get course detail
router.get('/courses/:courseId', extractUser, async function (req, res) {
  try {
    let courseObj = await Course.findByPk(req.params.courseId, {attributes: ['id', 'name', 'description', 'teacherId'],
      include: [
        {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
        {model: CourseCategory, as: 'category', attributes: ['name', 'id']},
        {
          model: Timeslot, attributes: ['id', 'weekDay', 'startTime', 'studentId'],
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
  } catch (err){
    handleError(err, res)
  }
})

// list teacher courses
router.get('/courses', extractUser, async function (req, res) {
  const options = {attributes: ['id', 'name', 'description'], where: {teacherId: req.user.id}, order: [['name', 'ASC']], include: [
      {model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName']},
      {model: CourseCategory, as: 'category', attributes: ['id', 'name']},
    ]}
  const courses = await Course.findAll(options)
  res.status(200).send(courses)
})

module.exports = router
