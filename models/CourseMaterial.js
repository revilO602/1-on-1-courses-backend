const Sequelize = require('sequelize');
const {db} = require('../database/init');
const {Course} = require("./Course");

const CourseMaterial = db.define('course_material', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  filePath: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },

}, {underscored: true})

CourseMaterial.belongsTo(Course, {
  as: 'course',
  foreignKey: {
    name: 'courseId',
    allowNull: false
  }
})
Course.hasMany(CourseMaterial, {
  as: 'materials',
  onDelete: 'CASCADE',
  foreignKey: {
    name: 'courseId',
    allowNull: false
  }
})

module.exports = {
  CourseMaterial: CourseMaterial,
}
