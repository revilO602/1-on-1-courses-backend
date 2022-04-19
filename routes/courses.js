const express = require('express')
const multer  = require('multer') // file upload middleware
const {User} = require("../models/User");
const {Timeslot} = require("../models/Timeslot");
const {Course} = require("../models/Course");
const router = express.Router()
const {auth} = require("../middleware/authorization")
const {CourseCategory} = require("../models/CourseCategory");
const extractUser = require("../middleware/extractUser");
const { Op } = require('sequelize');
const path = require("path");
const {CourseMaterial} = require("../models/CourseMaterial");
const getOverlappingTimeslots = require("../helpers/timeslotChecker")
const getTimeslots = require("../helpers/timeslotGetter")
const handleError = require("../helpers/errorHandler")

// setup upload middleware
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'media/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage })

router.use(auth) // use auth for every route

// list categories
router.get('/categories', async function (req, res) {
  try {
    let categories = await CourseCategory.findAll({attributes: ['id', 'name'], order: [['name', 'ASC']]})
    res.status(200).send(categories)
  } catch (err){
    handleError(err, res)
  }
})

// join course through timeslot id
router.post('/join', extractUser, async function (req, res) {
  const timeslotsArr = req.body
  let timeslots = []
  if (!Array.isArray(timeslotsArr) || !timeslotsArr.length){
    res.status(400).send({message: "Missing the timeslots array"})
  }
  try {
    for (timeslotId of timeslotsArr){
      let timeslot = await Timeslot.findByPk(timeslotId.id, {attributes: ['id', 'weekDay', 'startTime', 'studentId'],
        include: {model: Course, as: 'course', attributes: ['teacherId']}})
      if (!timeslot) {
        res.status(404).send({message: `Timeslot with ID:${timeslotId.id} does not exist`})
        return
      } else if (timeslot.course.teacherId === req.user.id){
        res.status(400).send({message: 'Can not join your own course'})
        return
      } else if (timeslot.studentId !== null){
        res.status(400).send({message: 'Timeslot already taken'})
        return
      } else {
        timeslots.push(timeslot)
      }
    }
    // check if timeslots overlap
    let userTimeslots = await getTimeslots(req.user)
    let overlappingTimeslots = getOverlappingTimeslots([...timeslots,...userTimeslots])
    if (overlappingTimeslots.length > 0){
      res.status(400).send({message: "Some of your timeslots overlap!",
        overlappingTimeslots: overlappingTimeslots});
      return
    }
    for (timeslot of timeslots){
      timeslot.studentId = req.user.id
      await timeslot.save()
    }
    res.status(200).send()
  } catch (err){
    handleError(err, res)
  }
})

// leave timeslots through timeslot id
router.post('/leave', extractUser, async function (req, res) {
  const timeslotsArr = req.body
  let timeslots = []
  if (!Array.isArray(timeslotsArr) || !timeslotsArr.length){
    res.status(400).send({message: "Missing the timeslots array"})
  }
  try {
    for (timeslotId of timeslotsArr){
      let timeslot = await Timeslot.findByPk(timeslotId.id)
      if (!timeslot) {
        res.status(404).send({message: `Timeslot with ID:${timeslotId.id} does not exist`})
        return
      } else if (timeslot.studentId !== req.user.id){
        res.status(403).send({message: `Timeslot with ID:${timeslotId.id} belongs to someone else!`})
        return
      } else {
        timeslots.push(timeslot)
      }
    }
    for (timeslot of timeslots){
      timeslot.studentId = null
      await timeslot.save()
    }
    res.status(204).send()
  } catch (err){
    handleError(err, res)
  }
})

// list students
router.get('/:courseId/students', extractUser, async function (req, res) {
  let students = []
  try {
    let courseObj = await Course.findByPk(req.params.courseId, {include: [
        {model: Timeslot, attributes: ['studentId', 'weekDay', 'startTime'],
          include: {model: User, as: "student", attributes: ['id', 'firstName', 'lastName']}
        },
        {model: User, as: "teacher", attributes: ['teacherId']}
      ]})
    if (!courseObj) {
        res.status(404).send({message: 'Course with given ID does not exist'})
      }
    if (courseObj.teacher.teacherId !== req.user.id) {
      res.status(403).send({message: 'You are not the teacher of this course'})
    }
    for (timeslot of courseObj.timeslots){
      if (timeslot.student){
        students.push(timeslot.student)
      }
    }
    res.status(200).send(students)
  } catch (err){
    handleError(err, res)
  }
})

//MATERIALS
//upload material to course
router.post('/:courseId/materials', extractUser, upload.single('file'), async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId)
    if (!courseObj) {
      res.status(404).send({message: 'Course with given ID does not exist'})
    }
    else if (courseObj.teacherId !== req.user.id) {
      res.status(403).send({message: 'You are not the teacher of this course'})
    } else {
      await CourseMaterial.create({filePath: req.file.filename, name: req.body.name, courseId: courseObj.id})
      res.status(201).send()
    }
  } catch (err){
    handleError(err, res)
  }
})
// list materials for course
router.get('/:courseId/materials', extractUser, async function (req, res) {
  let canAccess = false;
  try{
    let courseObj = await Course.findByPk(req.params.courseId, {include:[
        {model: CourseMaterial, as: 'materials', attributes: ['id', 'name', "filePath"]},
        {model: Timeslot, as: "timeslots", attributes: ['studentId', 'weekDay', 'startTime']}
      ]})
    if (!courseObj){
      res.status(404).send({message: 'Course with given ID does not exist'})
      return
    }
    if (courseObj.teacherId === req.user.id) {canAccess = true;}
    if (!canAccess){
      for (timeslot of courseObj.timeslots){
        if (timeslot.studentId === req.user.id){
          canAccess = true
          break;
        }
      }
    }
    if (!canAccess) {
      res.status(403).send({message: 'You do not have access to this course'})
    } else {
      res.status(200).send(courseObj.materials)
    }
  } catch (err){
    handleError(err, res)
  }
})

//TIMESLOTS

// delete timeslot from course
router.delete('/:courseId/timeslots/:timeslotId', extractUser, async function (req, res) {
  try {
    let courseObj = await Course.findByPk(req.params.courseId)
    if (!courseObj) {
      res.status(404).send({message: 'Course with given ID does not exist'})
      return
    }
    if (courseObj.teacherId !== req.user.id) {
      res.status(403).send({message: 'You are not the teacher of this course'})
      return
    }
    let timeslotObj = await Timeslot.findByPk(req.params.timeslotId)
    if (!timeslotObj) {
      res.status(404).send({message: 'Timeslot with given ID does not exist'})
      return
    }
    if (courseObj.id !== timeslotObj.courseId) {
      res.status(403).send({message: 'Timeslot does not belong to course'})
      return
    }
    timeslotObj.destroy()
    res.status(204).send()
  } catch (err){
    handleError(err, res)
  }
})

// add timeslot to course
router.post('/:courseId/timeslots', extractUser, async function (req, res) {
  let userTimeslots = await getTimeslots(req.user)
  try {
    let courseObj = await Course.findByPk(req.params.courseId)
    if (!courseObj) {
      res.status(404).send({message: 'Course with given ID does not exist'})
      return
    }
    if (courseObj.teacherId !== req.user.id) {
      res.status(403).send({message: 'You are not the teacher of this course'})
      return
    }
    let timeslotObj = await Timeslot.build(req.body)
    await timeslotObj.validate()
    // check if timeslots overlap
    let overlappingTimeslots = getOverlappingTimeslots([timeslotObj,...userTimeslots])
    if (overlappingTimeslots.length > 0){
      res.status(400).send({message: "Some of your timeslots overlap!",
        overlappingTimeslots: overlappingTimeslots});
      return
    }
    timeslotObj.courseId = courseObj.id
    let timeslot = await timeslotObj.save()
    res.status(201).send({id: timeslot.id})
  } catch (err){
    handleError(err, res)
  }
})

//COURSES
//get course detail
router.get('/:courseId', async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId, {attributes: ['id', 'name', 'description'], include: [
        {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
        {model: CourseCategory, as: 'category', attributes: ['id','name']},
        {model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
          where: { studentId: {[Op.is]: null }} // return only free timeslots
        }
      ]})
    if (courseObj){
      res.status(200).send(courseObj)
    } else {
      res.status(404).send({message: 'Course with given ID does not exist'})
    }
  } catch (err){
    handleError(err, res)
  }
})

// update course
router.put('/:courseId', extractUser, async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId, {include: [
        {model: Timeslot, attributes: ['id', 'weekDay', 'startTime']}
      ]})
    if (!courseObj){
      res.status(404).send({message: 'Course with given ID does not exist'})
    } else if (courseObj.teacherId !== req.user.id) {
      res.status(403).send({message: 'You are not the teacher of this course'})
    } else {
      let courseValidationObj = await Course.build({...req.body, teacherId: req.user.id}) // validate if everything in request body
      await courseValidationObj.validate()
      await courseObj.update(req.body)
      res.status(204).send()
    }
  } catch (err){
    handleError(err, res)
  }
})

// delete course
router.delete('/:courseId', extractUser, async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId)
    if (!courseObj){
      res.status(404).send({message: 'Course with given ID does not exist'})
    } else if (courseObj.teacherId !== req.user.id) {
      res.status(403).send({message: 'You are not the teacher of this course'})
    } else {
      await courseObj.destroy()
      res.status(204).send()
    }
  } catch (err){
    handleError(err, res)
  }
})

// list courses
router.get('/', async function (req, res) {
  const options = {where:{}, order: [['name', 'ASC']], attributes: ['id', 'name', 'description'], include: [
      {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
      {model: CourseCategory, as: 'category', attributes: ['name']},
      {model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
        where: { studentId: {[Op.is]: null }}
      }
    ]}
  // check if query params
  if (req.query.categoryId){
    options['where']['categoryId'] = req.query.categoryId
  }
  if (req.query.q){
    options['where']['name'] = { [Op.like]: '%' + req.query.q + '%' }
  }
  const courses = await Course.findAll(options)
  // return only courses that are joinable (have free timeslots)
  let coursesWithFreeTimeslots = courses.filter((course)=>{return course.timeslots.length > 0})
  res.status(200).send(coursesWithFreeTimeslots)
})

router.post('/', extractUser, async function (req, res) {
  const timeslots = req.body["timeslots"]
  let buildTimeslots = []
  let userTimeslots = await getTimeslots(req.user)
  if (!Array.isArray(timeslots) || !timeslots.length){
    res.status(400).send({message: "Missing the timeslots array"})
  }
  try{
    for (const timeslot of timeslots) {
      let timeslotObj = await Timeslot.build(timeslot)
      await timeslotObj.validate()
      buildTimeslots.push(timeslotObj)
    }
    console.log('oh god why')
    // check if timeslots overlap
    let overlappingTimeslots = getOverlappingTimeslots([...buildTimeslots,...userTimeslots])
    if (overlappingTimeslots.length > 0){
      res.status(400).send({message: "Some of your timeslots overlap!",
        overlappingTimeslots: overlappingTimeslots});
      return
    }
    const course = await Course.create({...req.body, teacherId: req.user.id})
    for (const timeslot of buildTimeslots) {
      timeslot.courseId = course.id
      await timeslot.save()
    }
    res.status(201).send()
  } catch (err){
    handleError(err, res)
  }
})

module.exports = router
