const Sequelize = require('sequelize');
const {db} = require('../database/init');

const User = db.define('user', {
  firstName: {
    type: Sequelize.STRING
  },
  lastName: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true,
    }
  },
  password: {
    type: Sequelize.STRING
  },
})

module.exports = {
  User: User,
}
