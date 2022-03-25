const {db} = require('./init')
const {Course} = require('../models/Course')
const {User} = require('../models/User')
const {CourseCategory} = require('../models/CourseCategory')

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
        email: "teacher1@login.sk",
        password: "heslo",
        firstName: "Teacher1",
        lastName: "Leontiev"
    });
    await User.create({
        email: "teacher2@login.sk",
        password: "heslo",
        firstName: "Teacher2",
        lastName: "Leontiev"
    });
    await User.create({
        email: "student1@login.sk",
        password: "heslo",
        firstName: "Student1",
        lastName: "Leontiev"
    });
    await User.create({
        email: "student2@login.sk",
        password: "heslo",
        firstName: "Student2",
        lastName: "Leontiev"
    });
    await User.create({
        email: "student3@login.sk",
        password: "heslo",
        firstName: "Student3",
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
