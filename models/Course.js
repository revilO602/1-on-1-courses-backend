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
  teacher_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      // This is a reference to another model
      model: User,
      // This is the column name of the referenced model
      key: 'id',
    }
  },
  category_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      // This is a reference to another model
      model: CourseCategory,
      // This is the column name of the referenced model
      key: 'id',
    }
  }
}, {underscored: true})

Course.hasMany(Timeslot)
Timeslot.belongsTo(Course)

module.exports = {
  Course: Course,
}
