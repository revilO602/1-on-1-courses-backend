const express = require('express')
const {Timeslot} = require("../models/Timeslot");
const {auth} = require("../middleware/authorization")
const extractUser = require("../middleware/extractUser");
const handleError = require("../helpers/errorHandler");
const {Course} = require("../models/Course");

const router = express.Router()
router.use(auth)

// list categories
router.get('/', extractUser, async function (req, res) {
  try {
    let teacherTimeslots = []
    let studentTimeslots = await Timeslot.findAll({where: {studentId: req.user.id},
      include:{model: Course, as: "course", attributes: ['name']}
    }) // student timeslots
    for (timeslot of studentTimeslots){
      timeslot["courseName"] = timeslot.course.name
    }
    let teacherCourses = await Course.findAll({where:{teacherId: req.user.id},
      include:{model: Timeslot, as: "timeslots", attributes: ['weekDay', 'startTime']}})
    for (course of teacherCourses){
      for (timeslot of course.timeslots){
        timeslot["courseName"] = course.name
        teacherTimeslots.push(timeslot)
      }
    }
    res.status(200).send({teacherTimeslots: teacherTimeslots, studentTimeslots: studentTimeslots})
  } catch (err){
    handleError(err, res)
  }
})

module.exports = router
