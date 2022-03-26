const express = require('express')
const {auth} = require("../middleware/authorization")
const extractUser = require("../middleware/extractUser");
const handleError = require("../helpers/errorHandler");
const {Course} = require("../models/Course");
const path = require("path");
const {CourseMaterial} = require("../models/CourseMaterial");
const {Timeslot} = require("../models/Timeslot");

const router = express.Router()
router.use(auth)

//download material
router.get('/:materialId', extractUser, async function (req, res) {
  let canAccess = false;
  try{
    let materialObj = await CourseMaterial.findByPk(req.params.materialId, {include:
      {model: Course, as: 'course', include: {model: Timeslot, as: 'timeslots', attributes: ['studentId']}}},
      )
    if (!materialObj){
      res.status(404).send({message: 'There is no material with given ID'})
      return
    }
    if (materialObj.course.teacherId === req.user.id){canAccess = true}
    if (!canAccess){
      for (timeslot of materialObj.course.timeslots){
        if (timeslot.studentId === req.user.id){
          canAccess = true
          break;
        }
      }
    }
    if (canAccess !== true){
      res.status(403).send({message: 'You do not have access to this course'})
      return
    }
    res.sendFile(path.join(__dirname, '..', 'media', materialObj.filePath))
  } catch (err){
    handleError(err, res)
  }
})

module.exports = router
