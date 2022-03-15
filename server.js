const {testDb} = require('./database/init');
const ip = require('ip');
const ipAddress = ip.address();
const express = require('express');

const server = express();
const port = 3000;
server.use('/', express.static('static'));
server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.listen(port, () => {
  console.log(`Server running at http://${ipAddress}:${port}`);
});
// Increment counter in advert
server.get('/', function (req, res) {
  res.send({res: "Hello World"})
})
testDb();
