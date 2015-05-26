function Node (configuration) {
  this._pullableData = configuration.pullableData;
  this._pushableData = configuration.pushableData;
  this._ws = configuration.ws;
  this._node = configuration.node;
  this._type = configuration.type;
};

Node.prototype.sendData = function (data) {
  if (this._ws !== undefined) {
    var msg = {
      // event: 'data',
      // data: {},
      // timestamp: Date.now()
    };
    for (var key in data) {
      msg[key] = data[key];
    }
    this._ws.send(JSON.stringify(msg));
  } else {
    console.log('No hay un socket conectado en el nodo ' + this._node);
  }
};

Node.prototype.setSocket = function (ws) {
  this._ws = ws;
};

Node.prototype.clearSocket = function () {
  this._ws = undefined;
};

Node.prototype.isConnected = function () {
  return typeof this._ws !== 'undefined';
};

Node.prototype.getInfo = function () {
  that = this;
  return {
    node: that._node,
    type: that._type,
    pushableData: that._pushableData,
    pullableData: that._pullableData,
    isConnected: that.isConnected()
  };
};

// module.exports = function (data) {

var nodes = {};

var nodesHandler = {};

nodesHandler.createNode = function (configuration, ws) {

  console.log('Creando un nodo nuevo llamado ' + configuration.node);

  ws.node = configuration.node;
  ws.type = 'node';

  if (nodes[configuration.node] === undefined)
    nodes[configuration.node] = new Node(configuration);
  nodes[configuration.node].setSocket(ws);

  return true;
};

nodesHandler.clearNodeSocket = function (node) {
  if (nodes[node] !== undefined) {
    nodes[node].clearSocket();
  } else {
    console.log('error en limpieza de ws');
  }
};

nodesHandler.setNodeSoket = function (node, ws) {
  if (nodes[node] !== undefined) {
    nodes[node].setSocket(ws);
  } else {
    console.log('error en asignación de ws');
  }
};

nodesHandler.sendDataToNode = function (node, data) {
  if (nodes[node] !== undefined) {
    nodes[node].sendData(data);
  } else {
    console.log('Se quiere enviar datos pero no exite el nodo');
  }
};

nodesHandler.getNodesInfo = function () {
  nodesInfo = {};
  for (var node in nodes) {
    nodesInfo[node] = nodes[node].getInfo();
  }
  return nodesInfo;
};

module.exports = nodesHandler;
