const express = require('express')
const {User} = require("../models/User");
const {Timeslot} = require("../models/Timeslot");
const {Course} = require("../models/Course");
const router = express.Router()
const {auth} = require("../middleware/authorization")
const {CourseCategory} = require("../models/CourseCategory");
const extractUser = require("../middleware/extractUser");

router.use(auth) // use auth for every route

// list student courses
router.get('/courses', extractUser, async function (req, res) {
  const options = {order: [['name', 'ASC']], include: [
      {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
      {model: CourseCategory, as: 'category', attributes: ['name']},
      {model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
        where: { studentId: req.user.id}
      }
    ]}
  const courses = await Course.findAll(options)
  // return only courses that are where user is student
  let studentCourses = courses.filter((course)=>{return course.timeslots.length > 0})
  res.status(200).send(studentCourses)
})

//get course detail
router.get('/courses/:courseId', async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId, {include: [
        {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
        {model: CourseCategory, as: 'category', attributes: ['name']},
        {model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
          where: { studentId: req.user.id} // return only student timeslots
        }
      ]})
    if (!courseObj) {
      res.status(404).send({message: 'Course with given ID does not exist'})
    } else if (courseObj.timeslots.length < 1){
      res.status(400).send({message: 'You are not a student of this course'})
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

module.exports = router
