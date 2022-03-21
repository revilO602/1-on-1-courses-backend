const express = require('express')
const {User} = require("../models/User");
const {Timeslot} = require("../models/Timeslot");
const {Course} = require("../models/Course");
const router = express.Router()
const {auth} = require("../middleware/authorization")
const {CourseCategory} = require("../models/CourseCategory");
const extractUser = require("../middleware/extractUser");
const { Op, where} = require('sequelize');

router.use(auth)

// list categories
router.get('/categories', function (req, res) {
  CourseCategory.findAll({attributes: ['id', 'name'], order: [['name', 'ASC']]}).catch(err => {
    console.log(err)
    res.status(404).send({
      message:
        err.message || "Some error occurred while creating course."
    });
  }).then(data => res.status(200).send(data));
})

router.get('/:id', async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.id, {include: [
        {model: User, as: 'teacher', attributes: ['firstName', 'lastName']},
        {model: CourseCategory, as: 'category', attributes: ['name']},
        {model: Timeslot, attributes: ['id', 'weekDay', 'startTime'],
          where: { studentId: {[Op.is]: null }}
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

router.post('/:id', function (req, res) {
    Course.create(req.body).catch(err => {
      res.status(400).send({
        message:
          err.message || "Some error occurred while creating course."
      });
    }).then(data => res.status(201).send(data));
})

// Work in progress
router.put('/:id', extractUser, async function (req, res) {
  try{
    let courseObj = await Course.findByPk(req.params.id)
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
  if (!Array.isArray(timeslots) || !timeslots.length){
    res.status(400).send({message: "Missing the timeslots array"})
  }
  try{
    for (const timeslot of timeslots) {
      let timeslotObj = await Timeslot.build(timeslot)
      buildTimeslots.push(timeslotObj)
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
