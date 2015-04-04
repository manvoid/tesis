/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');

var data = require('./connections.json');
var connections = data.connections;

// Get list of things
exports.index = function(req, res) {
  res.json(connections);
};

exports.addConnection = function(req, res) {
  console.log(JSON.stringify(req.body));
  var newObj = {
    'name': req.body.name,
    'port': req.body.port,
    'connected': 0,
    'last_data': 0
  };
  connections.push(newObj);
  console.log(JSON.stringify(connections));
  res.send(JSON.stringify(connections));
};
