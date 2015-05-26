
var data = require('./dataHandler.js');
var frontends = require('./frontendsHandler.js');
var nodes = require('./nodesHandler.js');
var widgets = require('./widgetsHandler.js');


module.exports = function (wss) {
  'use strict';

  widgets.createWidget('widget1');
  widgets.setWidgetIntervalTime('widget1', 1000);
  widgets.setWidgetRun('widget1', function () {
    var value = data.get('pythonSocket', 'encoder1');
    nodes.sendDataToNode('pythonSocket', {'encoder1': value});
  });
  widgets.startWidgetInterval('widget1');

  // widgets.createWidget('widget2');
  // widgets.setWidgetIntervalTime('widget2', 1000);
  // widgets.setWidgetRun('widget2', function () {
  //   sockets.sendDataToSocket('cppclient', {control1: Math.random()});
  // });
  // widgets.startWidgetInterval('widget2');


  wss.on('connection', function connection(ws) {
    console.log('Se conectó un socket nuevo');

    ws.on('message', function incoming(message) {
      var message = JSON.parse(message);

      if(ws.node !== undefined) {
        // switch (message.event) {
        // case 'data':
        //   if (message.timestamp === undefined)
        //     message.timestamp = Date.now();
        //   sockets.setSocketData(ws.socket, message.data, message.timestamp);
        //   sockets.showSocketData(ws.socket);
        //   break;
        // default:
        //   console.log('No se reconoció el evento');
        // }
        // switch (ws.type) {
        // case 'node':
        //   // nodes.sendEvent(event, ws.socket);
        //   break;
        // case 'frontend':
        //   // frontends.sendEvent();
        //   break;
        // default:
        //   console.log('No se detectó el tipo de socket');
        // }n
        if (ws.type === 'frontend') {
          switch (message.event) {
          case 'data':
            break;
          case 'getNodesInfo':
            frontends.emit({event: 'nodesInfo', nodes: nodes.getNodesInfo()}, ws.node);
            console.log('se solicito un nodesinfo de parte de un frontend');
            break;
          }
        } else if (ws.type === 'node') {
          data.update(ws.node, message.data || message, message.timestamp || Date.now());
        }
      } else {
        if (message.event === 'configure') {
          if (message.type === 'node') {
            nodes.createNode(message, ws);
            data.create(message.node, message.pushableData);
          } else if (message.type === 'frontend') {
            frontends.createNode(message, ws);
          }
        }
      }

    });

    ws.on('close', function close(code, message) {
      if (ws.type === 'node') {
        console.log('Se desconectó un nodo');
        nodes.clearNodeSocket(ws.node);
      } else if (ws.type === 'frontend' ) {
        console.log('Se desconectó un frontend');
        frontends.clearNodeSocket(ws.node);
      } else {
        console.log('No se reconoce el socket que se desconectó');
      }
    });

  });

  wss.on('error', function (error) {
    console.log('Error en el ws: ');
    console.log(error);
  });
};
