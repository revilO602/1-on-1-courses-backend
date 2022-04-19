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
  try{
    let courseObj = await Course.findByPk(req.params.courseId, {attributes: ['id', 'name', 'description'], include: [
        {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
        {model: CourseCategory, as: 'category', attributes: ['id', 'name']},
        {model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
          where: { studentId: req.user.id} // return only student timeslots
        }
      ]})
    if (!courseObj) {
      res.status(404).send({message: 'There is no course with given ID where you are a student'})
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


// list student courses
router.get('/courses', extractUser, async function (req, res) {
  const options = {attributes: ['id', 'name', 'description'], order: [['name', 'ASC']], include: [
      {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
      {model: CourseCategory, as: 'category', attributes: ['id', 'name']},
      {model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
        where: { studentId: req.user.id}
      }
    ]}
  const courses = await Course.findAll(options)
  // return only courses where user is student
  let studentCourses = courses.filter((course)=>{return course.timeslots.length > 0})
  res.status(200).send(studentCourses)
})

module.exports = router
