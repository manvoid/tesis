/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
var socketio = require('socket.io');
// Setup server
var app = express();
var server = require('http').createServer(app);
var io = socketio.listen(server);
require('./config/express')(app);
require('./routes')(app);
require('./sockets/base')(io);

// io connectionsV
// io.on('connection', function (socket) {
//   console.log('Conexión establecida');
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
// });

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
