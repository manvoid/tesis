function Node (configuration) {
  this.ws = configuration.ws;
  this.node = configuration.node;
  this.type = configuration.type;

  switch (this.type) {
  case 'node':
    this.pullableData = configuration.pullableData;
    this.pushableData = configuration.pushableData;
    break;
  case 'frontend':
    break;
  }
};

Node.prototype.send = function (msg) {
  if (this.ws !== undefined) {
    this.ws.send(JSON.stringify(msg));
  } else {
    console.log('No hay un socket conectado en el nodo ' + this.node);
  }
};

Node.prototype.isConnected = function () {
  return typeof this.ws !== 'undefined';
};

Node.prototype.getInfo = function () {
  // that = this;
  var info = {
    node: this.node,
    type: this.type,
    isConnected: this.isConnected()
  };

  switch (this.type) {
  case 'node':
    info.pushableData = this.pushableData;
    info.pullableData = this.pullableData;
    break;
  }

  return info;
};

var nodes = {};
var frontends = [];
var frontendsCount = 0;

var nodesHandler = {};

nodesHandler.createNode = function (configuration, ws) {

  if (configuration.type === 'frontend') {
    configuration.node = 'frontend' + frontendsCount++;
    frontends.push(configuration.node);
  }
  
  console.log('Creando un nodo nuevo llamado ' + configuration.node);

  ws.node = configuration.node;
  ws.type = configuration.type;
  ws.listeningTopics = [];

  if (nodes[configuration.node] === undefined) {
    nodes[configuration.node] = new Node(configuration);
  }
  nodes[configuration.node].ws = ws;

  return true;
};

nodesHandler.clearNodeSocket = function (node) {
  if (nodes[node] !== undefined) {
    nodes[node].ws = undefined;
  } else {
    console.log('error en limpieza de ws');
  }
};

nodesHandler.deleteNode = function (node) {
  if (nodes[node].type === 'frontend') {
    var index = frontends.indexOf(node);
    if (index > -1) {
      frontends.splice(index, 1);
    }
  }
  delete nodes[node];
};

nodesHandler.setNodeSoket = function (node, ws) {
  if (nodes[node] !== undefined) {
    nodes[node].ws = ws;
  } else {
    console.log('error en asignación de ws');
  }
};

nodesHandler.sendDataToSubscriptor = function (data, subscriptor) {
  
  if (nodes[subscriptor.node] !== undefined) {
    switch (nodes[subscriptor.node].type) {
    case 'node':
      msg = {};
      msg[subscriptor.name] = data.value;
      break;
    case 'frontend':
      msg = {
        event: 'data',
        data: data,
        timestamp: Date.now()
      };
      break;
    }
    nodes[subscriptor.node].send(msg);
  } else {
    console.log(JSON.stringify(subscriptor));
    console.log('Se quiere enviar datos pero no exite el nodo');
  }
};

nodesHandler.sendValueToTopic = function (value, topic) {
  if (nodes[node] !== undefined) {
    switch (nodes[node].type) {
    case 'node':
      msg = {};
      msg[topic.name] = value;
      break;
    case 'frontend':
      msg = {
        event: 'data',
        topic: topic,
        value: value,
        timestamp: Date.now()
      };
      break;
    }
    nodes[node].send(msg);
  } else {
    console.log('Se quiere enviar datos pero no exite el nodo');
  }
};

nodesHandler.getNodeInfo = function (node) {
  return nodes[node].getInfo();
};

nodesHandler.getNodesInfo = function () {
  nodesInfo = {};
  for (var node in nodes) {
    nodesInfo[node] = nodes[node].getInfo();
  }
  return nodesInfo;
};

nodesHandler.broadcastToFrontends = function (msg) {
  for (var i=0; i<frontends.length; i++) {
    nodes[frontends[i]].send(msg);
  }
};

nodesHandler.sendToNode = function (msg, node) {
  nodes[node].send(msg);
};

nodesHandler.addTopicToNode = function (topic, node) {
  console.log('nodesHandler l167: El tópico y nodo son, para ser agregador');
  console.log(JSON.stringify(topic) + ' ' + node);
  nodes[node].ws.listeningTopics.push(topic);
  console.log('Los topicos listening de ' + node + ' son');
  console.log(nodes[node].ws.listeningTopics);
};

nodesHandler.removeTopicFromNode = function (topic, node) {
  var index = nodes[node].ws.listeningTopics.indexOf(topic);
  if (index > -1) {
    nodes[node].ws.listeningTopics.slice(index, 1);
  }
}

module.exports = nodesHandler;
