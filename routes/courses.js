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
const isCollision = require("../helpers/timeslotChecker")
const getTimeslots = require("../helpers/timeslotGetter")

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
    res.status(404).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }
})

// join course through timeslot id
router.get('/join/:timeslotId', extractUser, async function (req, res) {
  try {
    let timeslotObj = await Timeslot.findByPk(req.params.timeslotId, {include: [
        {model: Course, as: 'course', attributes: ['teacherId']},
      ]})
    if (!timeslotObj){
      res.status(404).send({message: 'Timeslot with given ID does not exist'})
    } else if (timeslotObj.course.teacherId === req.user.id){
      res.status(400).send({message: 'Can not join your own course'})
    } else if (timeslotObj.studentId !== null){
      res.status(400).send({message: 'Timeslot already taken'})
    } else {
      timeslotObj.studentId = req.user.id
      await timeslotObj.save()
      res.status(200).send()
    }
  } catch (err){
    res.status(400).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }
})

//MATERIALS
//download material
router.get('/:courseId/materials/:materialId', async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId, {include:
        {model: CourseMaterial, as: 'materials', where: {id: req.params.materialId}, attributes: ['id', 'filePath']}})
    if (courseObj && courseObj.materials.length > 0){
      res.sendFile(path.join(__dirname, '..', 'media', courseObj.materials[0].filePath))
    } else {
      res.status(404).send({message: 'Not found'})
    }
  } catch (e){
    res.status(400).send({
      message:
        e.message || "Some error occurred while creating course."
    });
  }
})

//upload material to course
router.post('/:courseId/materials', upload.single('material'), async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId)
    if (courseObj){
      await CourseMaterial.create({filePath: req.file.filename, name: req.body.name, courseId: courseObj.id})
      res.status(201).send()
    } else {
      res.status(404).send({message: 'Course with given ID does not exist'})
    }
  } catch (e){
    res.status(400).send({
      message:
        e.message || "Some error occurred while creating course."
    });
  }
})
// list materials for course
router.get('/:courseId/materials', async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId, {include:
        {model: CourseMaterial, as: 'materials', attributes: ['id', 'name']}})
    if (courseObj){
      res.status(201).send(courseObj.materials)
    } else {
      res.status(404).send({message: 'Course with given ID does not exist'})
    }
  } catch (e){
    res.status(400).send({
      message:
        e.message || "Some error occurred while creating course."
    });
  }
})

//COURSES
//get course detail
router.get('/:courseId', async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId, {include: [
        {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
        {model: CourseCategory, as: 'category', attributes: ['name']},
        {model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
          where: { studentId: {[Op.is]: null }} // return only free timeslots
        }
      ]})
    if (courseObj){
      res.status(200).send(courseObj)
    } else {
      res.status(404).send({message: 'Course with given ID does not exist'})
    }
  } catch (e){
    res.status(400).send({
      message:
        e.message || "Some error occurred while creating course."
    });
  }
})

// WIP
router.put('/:courseId', extractUser, async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.courseId)
    if (!courseObj){
      res.status(404).send({message: 'Course with given ID does not exist'})
    } else if (courseObj.teacherId !== req.user.id) {
      res.status(401).send({message: 'You are not the teacher of this course'})
    } else {
      courseObj.update(req.body)
    }
  } catch (e){
    res.status(400).send({
      message:
        e.message || "Some error occurred while creating course."
    });
  }
})

// list courses
router.get('/', async function (req, res) {
  const options = {where:{}, order: [['name', 'ASC']], include: [
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
      buildTimeslots.push(timeslotObj)
    }
    // check if timeslots overlap
    if (isCollision([...buildTimeslots,...userTimeslots])){
      res.status(400).send({message: "Some of your timeslots overlap!"});
      return
    }
    const course = await Course.create({...req.body, teacherId: req.user.id})
    for (const timeslot of buildTimeslots) {
      timeslot.courseId = course.id
      await timeslot.save()
    }
    res.status(201).send()
  } catch (err){
    res.status(400).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }
})

module.exports = router
