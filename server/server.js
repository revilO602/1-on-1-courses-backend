// LIBRARY IMPORTS
const express = require('express'); //server framework
const os = require('os'); // used to extract out-facing IP from OS
// OWN IMPORTS
const {testDb} = require('../database/init');
const {createTables} = require('../database/construct');

const server = express();
const port = 3000;
// MIDDLEWARE
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

const networkInterfaces = os.networkInterfaces();

// start server
server.listen(port, () => {
  let ipAddress = networkInterfaces['Wi-Fi'].find(con => con.family === 'IPv4')['address'];
  console.log(`Server running at http://${ipAddress}:${port}`);
});


server.get('/', function (req, res) {
  res.send({res: "Hello World"})
})
testDb();
createTables()
