const Sequelize = require('sequelize');
const {db} = require('../database/init');
const {User} = require("./User");
const {CourseCategory} = require("./CourseCategory");
const {Timeslot} = require("./Timeslot");

const Course = db.define('course', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
}, {underscored: true})

Course.hasMany(Timeslot)
Timeslot.belongsTo(Course)

Course.belongsTo(User, {
  as: 'teacher',
  foreignKey: {
    name: 'teacherId',
    allowNull: false
  }
})
User.hasMany(Course, {
  as: 'courses',
  foreignKey: {
    name: 'teacherId',
    allowNull: false
  }
})

Course.belongsTo(CourseCategory, {
  as: 'category',
  foreignKey: {
    name: 'categoryId',
    allowNull: false
  }
})

CourseCategory.hasMany(Course, {
  as: 'courses',
  foreignKey: {
    name: 'categoryId',
    allowNull: false
  }
})

module.exports = {
  Course: Course,
}
