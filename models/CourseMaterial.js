const Sequelize = require('sequelize');
const {db} = require('../database/init');
const {Course} = require("./Course");
const {User} = require("./User");

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

CourseMaterial.belongsTo(Course, {
  as: 'course',
  foreignKey: {
    name: 'courseId',
    allowNull: false
  }
})
Course.hasMany(CourseMaterial, {
  as: 'course',
  foreignKey: {
    name: 'courseId',
    allowNull: false
  }
})

module.exports = {
  CourseMaterial: CourseMaterial,
}
