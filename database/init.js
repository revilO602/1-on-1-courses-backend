require('dotenv').config();

const Sequelize = require('sequelize');
const db = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, {
    host: 'localhost',
    dialect: 'postgres'
});

async function testDb(){
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = {
    db: db,
    testDb: testDb,
}
