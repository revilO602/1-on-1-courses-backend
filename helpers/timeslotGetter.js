// Get all timeslots a user has a lesson (teacher AND student)
const {Timeslot} = require("../models/Timeslot");
const {Course} = require("../models/Course");

async function getTimeslots(user){
  let timeslots = await Timeslot.findAll({attributes: ['weekDay', 'startTime'],
    where: {studentId: user.id}}) // student timeslots
  let teacherCourses = await Course.findAll({where:{teacherId: user.id},
    include:{model: Timeslot, attributes: ['weekDay', 'startTime']}})
  for (course of teacherCourses){
    timeslots.push(...course.timeslots)
  }
  return timeslots
}

module.exports = getTimeslots
