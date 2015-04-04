'use strict';

var _ = require('lodash');
var io = require('socket.io')(http);

exports.index = function(req, res) {
  res.json("hola mundo");
};
