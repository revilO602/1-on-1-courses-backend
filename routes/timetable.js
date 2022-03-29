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
    let studentTimeslots = await Timeslot.findAll({attributes: ['id', 'weekDay', 'startTime'], where: {studentId: req.user.id},
      include:{model: Course, as: "course", attributes: ['name']}
    }) // student timeslots
    let teacherCourses = await Course.findAll({where:{teacherId: req.user.id},
      include:{model: Timeslot, as: "timeslots", attributes: ['id', 'weekDay', 'startTime'],
        include:{model: Course, as: "course", attributes: ['name']}}})
    for (course of teacherCourses){
      teacherTimeslots = [...teacherTimeslots, course.timeslots]
    }
    res.status(200).send({teacherTimeslots: teacherTimeslots, studentTimeslots: studentTimeslots})
  } catch (err){
    handleError(err, res)
  }
})

module.exports = router
