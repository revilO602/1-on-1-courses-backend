const Sequelize = require('sequelize');
const {db} = require('../database/init');
const {Course} = require("./Course");

const CourseMaterial = db.define('course_material', {
  name: {
    type: Sequelize.STRING
  },
  filePath: {
    type: Sequelize.STRING,
    unique: true,
  },
  course_id: {
    type: Sequelize.INTEGER,
    references: {
      // This is a reference to another model
      model: Course,
      // This is the column name of the referenced model
      key: 'id',
    },
  }
}, {underscored: true})

module.exports = {
  CourseMaterial: CourseMaterial,
}
