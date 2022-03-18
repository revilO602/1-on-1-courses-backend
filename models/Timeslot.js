const Sequelize = require('sequelize');
const {db} = require('../database/init');
const {User} = require("./User");
const {Course} = require("./Course");

const Timeslot = db.define('timeslots', {
  weekDay: {
    type: Sequelize.ENUM(
      'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday', 'Sunday'
    ),
    allowNull: false
  },
  startTime: {
    type: Sequelize.TIME,
    allowNull: false
  },
  student_id: {
    type: Sequelize.INTEGER,
    references: {
      // This is a reference to another model
      model: User,
      // This is the column name of the referenced model
      key: 'id',
    },
  },
  // course_id: {
  //   type: Sequelize.INTEGER,
  //   references: {
  //     // This is a reference to another model
  //     model: Course,
  //     // This is the column name of the referenced model
  //     key: 'id',
  //   },
  // }
}, {underscored: true})

module.exports = {
  Timeslot: Timeslot,
}
