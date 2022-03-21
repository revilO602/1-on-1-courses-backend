const Sequelize = require('sequelize');
const {db} = require('../database/init');
const {User} = require("./User");

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
}, {underscored: true})

Timeslot.belongsTo(User, {
  as: 'student',
  foreignKey: {
    name: 'studentId',
  }
})

User.hasMany(Timeslot, {
  as: 'timeslots',
  foreignKey: {
    name: 'studentId',
  }
})

module.exports = {
  Timeslot: Timeslot,
}
