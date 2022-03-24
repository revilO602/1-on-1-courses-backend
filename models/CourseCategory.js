const Sequelize = require('sequelize');
const {db} = require('../database/init');

const CourseCategory = db.define('course_category', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique:true
  },
}, {underscored: true})

module.exports = {
  CourseCategory: CourseCategory,
}
