const Sequelize = require('sequelize');
const {db} = require('../database/init');

const Product = db.define('product', {
    name: {
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING
    },
    price: {
        type: Sequelize.DECIMAL(10,2)
    },
})

module.exports = {
    Product: Product,
}