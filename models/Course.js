const Sequelize = require('sequelize');
const {db} = require('../database/init');
const {User} = require("./User");
const {CourseCategory} = require("./CourseCategory");

const Course = db.define('course', {
  name: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.STRING
  },
  teacher_id: {
    type: Sequelize.INTEGER,
    references: {
      // This is a reference to another model
      model: User,
      // This is the column name of the referenced model
      key: 'id',
    }
  },
  category_id: {
    type: Sequelize.INTEGER,
    references: {
      // This is a reference to another model
      model: CourseCategory,
      // This is the column name of the referenced model
      key: 'id',
    }
  }
})

module.exports = {
  Course: Course,
}
