// LIBRARY IMPORTS
const express = require('express'); //middleware framework
const os = require('os'); // used to extract out-facing IP from OS

// OWN IMPORTS
const {testDb} = require('./database/init');
const {createTables} = require('./database/construct');

const server = express();
const port = 3000;
// MIDDLEWARE
server.use(express.json());
server.use(express.urlencoded({ extended: false }));


const networkInterfaces = os.networkInterfaces();

// start middleware
server.listen(port, () => {
  let ipAddress = networkInterfaces['Wi-Fi'].find(con => con.family === 'IPv4')['address'];
  console.log(`Server running at http://${ipAddress}:${port}`);
});


server.get('/', function (req, res) {
  res.status(418).send("Hello World")
})

testDb();
createTables()

// routing
const userRouter = require('./routes/users')
server.use('/users', userRouter)

const courseRouter = require('./routes/courses')
server.use('/courses', courseRouter)
