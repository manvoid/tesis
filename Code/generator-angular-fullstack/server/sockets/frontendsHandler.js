function FrontendNode (configuration) {
  this._ws = configuration.ws;
  this._name = configuration.socket;
  this._type = configuration.type;
};

FrontendNode.prototype.send = function (msg) {
  if (this._ws !== undefined) {
    this._ws.send(JSON.stringify(msg));
  } else {
    console.log('No hay un frontend conectado en ' + this._name);
  }
};

FrontendNode.prototype.sendData = function (data) {
  var msg = {
    event: 'data',
    data: data
  };
};

FrontendNode.prototype.setSocket = function (ws) {
  this._ws = ws;
};

FrontendNode.prototype.clearSocket = function () {
  this._ws = undefined;
}

FrontendNode.prototype.getInfo = function () {

};

var frontends = {};

var events = {
  widget1: [],
  wdget2: []
};

var frontendsHandler = {};

frontendsHandler.createNode = function (configuration, ws) {

  console.log('Creando un frontend nuevo llamado ' + configuration.node);

  ws.node = configuration.node;
  ws.type = 'frontend';

  if (frontends[configuration.node] === undefined)
    frontends[configuration.node] = new FrontendNode(configuration);
  frontends[configuration.node].setSocket(ws);
};

frontendsHandler.clearNodeSocket = function (node) {
  if (frontends[node] !== undefined) {
    frontends[node].clearSocket();
  } else {
    console.log('error en limpieza de socket');
  }
};

frontendsHandler.setNodeSocket = function (node, ws) {
  if (frontends[node] !== undefined) {
    frontends[node].setSocket(ws);
  } else {
    console.log('error en asignación de ws');
  }
};

frontendsHandler.emit = function (msg, node) {
  var event = msg.event;
  frontends[node].send(msg);
  // switch (event) {
  // case 'nodesInfo':
  //   frontends[node].send(msg);
  //   break;
  // default:
  //   break;
  // }
};

frontendsHandler.broadcast = function (msg) {
  for (var node in frontends) {
    frontends[node].send(msg)
  }
};

frontendsHandler.sendDataToNode = function (node, data) {
  
};

module.exports = frontendsHandler;
