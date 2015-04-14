module.exports = function (wss) {
  'use strict';

  var frontends = [];
  var subscribers = [];
  var publishers = [];
  var nodes = {};

  var getNodes = function () {
    var nodes_mapped = {};
    for (var key in nodes) {
      nodes_mapped[key] = {}
      nodes_mapped[key].subscribers = [];
      nodes_mapped[key].type = nodes[key].type;
      var connected;
      nodes[key].socket === undefined ? connected = false : connected = true;
      nodes_mapped[key].connected = connected;
      for (var subscriber in nodes[key].subscribers) {
        nodes_mapped[key].subscribers.push(nodes[key].subscribers[subscriber].node);
      }
    }
    return nodes_mapped;
  };

  var updateNodes = function () {
    var nodes_mapped = getNodes();
    var msg = JSON.stringify({event: 'nodes', nodes: nodes_mapped});
    for (var key in frontends) {
      frontends[key].send(msg);
    }
  };

  var configure = function (configuration, ws, error) {

    if (ws.type !== undefined) {
      console.log('Ya se tenía asignado un tipo');
      console.log('Procediendo a desconectar');
      ws.close();
      return;
    }

    if (configuration.event === 'configuration') {
      switch (configuration.type) {
      case 'frontend':
        ws.type = 'frontend';
        ws.node = configuration.node;
        ws.subscribedTo = [];
        frontends.push(ws);
        console.log('se agregó un nuevo frontend');
        break;
      case 'subscriber':
        console.log('Se agregó un subscriptor');
        ws.type = 'subscriber';
        ws.node = configuration.node;
        if (nodes[ws.node] === undefined)
          nodes[ws.node] = {}
        nodes[ws.node].type = ws.type;
        nodes[ws.node].socket = ws;
        updateNodes();
        break;
      case 'publisher':
        console.log('Se agregó un publicador');        
        ws.type = 'publisher';
        ws.node = configuration.node;
        if (nodes[ws.node] === undefined)
          nodes[ws.node] = {subscribers: [], type: ws.type};
        nodes[ws.node].socket = ws;
        console.log('Se agregó un nuevo publisher');
        updateNodes();
        break;
      default:
        error();
      }
    } else {
      error();
    }
  };

  wss.on('connection', function connection(ws) {
    console.log('Se conectó un socket nuevo');

    ws.on('message', function incoming(message) {
      // console.log('received: %s', message);

      if (ws.type !== 'video')
        var message = JSON.parse(message);

      // Commands that the frontend can send to the server
      if (ws.type === 'frontend') {
        switch(message.event) {
        case 'getNodes':
          console.log('la lista de nodos es: ');
          var nodes_mapped = getNodes();
          console.log(nodes_mapped);
          ws.send(JSON.stringify({event: 'nodes', nodes: nodes_mapped}))
          break;
        case 'broadcast_to_frontends':
          for (var key in frontends) {
            frontends[key].send('mensaje broadcastado');
          }
          break;
        case 'data':
          console.log('Se enviaron datos a un suscriptor');
          console.log(message);
          nodes[message.node].socket.send(message.data.toString());
          break;
        case 'subscribeTo':
          if (nodes[message.node] === undefined)
            nodes[message.node] = {subscribers: [], type: 'none'}
          nodes[message.node].subscribers.push(ws);
          ws.subscribedTo.push(message.node);
          updateNodes();
          break;
        case 'unsubscribeFrom':
          // console.log('Se desuscribió de %s', message.topic);
          if (nodes[message.node] !== undefined) {
            var index = nodes[message.node].subscribers.indexOf(ws);
            if (index > -1) nodes[message.node].subscribers.splice(index, 1);
            var index = ws.subscribedTo.indexOf(message.node);
            if (index > -1) ws.subscribedTo.splice(index, 1);
          }
          updateNodes();
          break;
        default:
          console.log('no se reconoció el evento');
        }
      }

      switch(ws.type) {
      case 'frontend':
        console.log('Mensaje de FRONTEND');
        break;
      case 'subscriber':
        console.log('Mensaje de SUBSCRIBER');
        break;
      case 'publisher':
        var msg = {
          event: 'data',
          node: ws.node,
          data: message.data,
          timestamp: message.timestamp
        };
        msg = JSON.stringify(msg);
        for (var key in nodes[ws.node].subscribers)
          nodes[ws.node].subscribers[key].send(msg);
        break;
      default:
        configure(message, ws, function error() {
          console.log('es un socket no identificado, por favor identifiquese');
        });
      }

    });

    ws.on('close', function close(code, message) {
      console.log('Se desconectó un socket');
      if (ws.type === 'frontend') {
        console.log('Se desconectó un frontend');
        var index = frontends.indexOf(ws);
        if (index > -1) frontends.splice(index, 1);
        for (var key in ws.subscribedTo) {
          var index = nodes[ws.subscribedTo[key]].subscribers.indexOf(ws);
          if (index > -1) nodes[ws.subscribedTo[key]].subscribers.splice(index, 1);
        }
        updateNodes();
      } else if (ws.type === 'publisher' || ws.type === 'subscriber') {
        console.log('Se desconectó un publisher o suscriptor');
        delete nodes[ws.node].socket;
        updateNodes();
      }
    });

  });

  wss.on('error', function (error) {
    console.log('Error en el ws: ');
    console.log(error);
  });
};
