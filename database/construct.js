const {db} = require('./init')
const {Course} = require('../models/Course')
const {User} = require('../models/User')
const {CourseCategory} = require('../models/CourseCategory')
const {CourseMaterial} = require('../models/CourseMaterial')
const {Timeslot} = require('../models/Timeslot')

async function createCourseCategories(){
    await CourseCategory.create({name: 'Music'});
    await CourseCategory.create({name: 'Mathematics'});
    await CourseCategory.create({name: 'Art'});
    await CourseCategory.create({name: 'Writing'});
    await CourseCategory.create({name: 'English'});
    await CourseCategory.create({name: 'Programming'});
    await CourseCategory.create({name: 'Sport'});
}

async function createUsers(){
    await User.create({
        email: "login@login.sk",
        password: "login",
        firstName: "Oliver",
        lastName: "Leontiev"
    });
    await User.create({
        email: "login2@login.sk",
        password: "login2",
        firstName: "Oliver2",
        lastName: "Leontiev"
    });
}

async function createTables(){
    await db.sync({ force: true });
    console.log('DATABASE RESET')
    console.log("Creating course categories");
    await createCourseCategories()
    console.log("Creating users");
    await createUsers()
}

module.exports = {
    createTables: createTables,
}
