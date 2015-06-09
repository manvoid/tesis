module.exports = function (wss) {
  'use strict';

  var nodes = require('./nodesHandler.js');
  var topics = require('./topicsHandler.js');
  var scripts = require('./scriptsHandler.js');
  var pages = require('./pagesHandler.js');

  var publish = function (value, topic) {
    var topicSubscriptions = topics.getSubscriptions(topic);
    var data = {
      topic: topic,
      value: value
    };
    for (var i=0; i<topicSubscriptions.length; i++) {
      nodes.sendDataToSubscriptor(data, topicSubscriptions[i]);
    }
    scripts.emit(topic.node + ':' + topic.name, value);
  };

  var subscribeToTopic = function (subscriptor, topic) {
    console.log('Suscribir a un topico');
    console.log(JSON.stringify(subscriptor) + ' ' + JSON.stringify(topic));
    nodes.addTopicToNode(topic, subscriptor.node);
    topics.addSubscriptorToTopic(subscriptor, topic);
  }

  var unsubscribeFromTopic = function (subscriptor, topic) {
    nodes.removeTopicFromNode(topic, subscriptor.node);
    topics.removeSubscriptorFromTopic(subscriptor, topic);
  }

  pages.addWidgetToPage({
    type: 'echo',
    style: 'echo',
    listenTopic: {node: 'pythonSocket', name: 'encoder1'}
  },0);

    pages.addWidgetToPage({
    type: 'echo',
    style: 'echo',
    listenTopic: {node: 'pythonSocket', name: 'encoder2'}
  },0);

  wss.on('connection', function connection(ws) {
    console.log('Se conectó un socket nuevo');

    ws.on('message', function incoming(message) {
      // console.log(message);
      var message = JSON.parse(message);

      if(ws.node !== undefined) {
        if (ws.type === 'frontend') {
          switch (message.event) {
          case 'data':
            break;
          case 'getNodesInfo':
            nodes.sendToNode({event: 'nodesInfo', nodes: nodes.getNodesInfo()}, ws.node);
            console.log('se solicito un nodesinfo de parte de un frontend');
            break;
          case 'getWidgetsInfo':
            nodes.sendToNode({event: 'widgetsInfo', widgets: widgets.getWidgetsInfo()}, ws.node);
            console.log('se solicitó un widgetsinfo de parte de un frontend');
            console.log(widgets.getWidgetsInfo());
            break;
          case 'initWidgetsInPage':
            // Message has the name of one page of widgets that has to be initialized with the frontend ws
            console.log('Se solicitó iniciar widgets en ' + message.page);
            console.log(JSON.stringify(message));
            console.log(ws.node);
            var widgetsInPage = pages.getWidgetsFromPage(message.page);
            for (var i=0; i<widgetsInPage.length; i++) {
              var widget = widgetsInPage[i];
              for (var j=0; j<widget.connections.length; j++) {
                var connection = widget.connections[j];
                var from = {node: connection.from.node, name: connection.from.name};
                var to = {node: connection.to.node, name: connection.to.name};
                if (to.node === 'this')
                  to.node = ws.node
                if (from.node === 'this')
                  from.node = ws.node
                subscribeToTopic(to, from);
              }
            }
            break;
          case 'createScript':
            console.log('Creando listener script');
            console.log(JSON.stringify(message));
            script = scripts.createScript(message, function () {
              var b = 0;
              this.addListener('pythonSocket:encoder1', function (value) {
                publish('pythonSocket', {control1: value*-1});
                b = Math.random();
              });

              this.spin(function () {
                publish('pythonSocket2', {control2: b});
              });
            });
            nodes.broadcastToFrontends({event: 'scriptConnect', script: scripts.getScriptInfo(script)});
            break;
          }
        } else if (ws.type === 'node') {
          for (var data in message) {
            var value = message[data];
            publish(value, {node: ws.node, name: data});
          }
        }
      } else {
        if (message.event === 'configure') {
          if (message.type === 'node') {
            nodes.createNode(message, ws);
            for (var i=0; i<message.pushableData.length; i++) {
              topics.create({node: message.node, name: message.pushableData[i]});
            }
            // for (var i=0; i<message.pullableData.length; i++) {
            //   topics.subscribeToTopic({node: ws.node, });
            // }
            nodes.broadcastToFrontends({event: 'nodeConnect', node: nodes.getNodeInfo(message.node)});
          } else if (message.type === 'frontend') {
            nodes.createNode(message, ws);
            var pagesInfo = pages.getPagesInfo();
            nodes.sendToNode({event: 'pagesInfo', pages: pagesInfo}, ws.node);
            nodes.broadcastToFrontends({event: 'nodeConnect', node: nodes.getNodeInfo(message.node)});
          }
        }
      }

    });

    ws.on('close', function close(code, message) {
      if (typeof ws.type !== 'undefined') {
        console.log('Se desconectó un nodo topo: ' + ws.type);
        console.log(ws.listeningTopics);
        for (var i=0; i<ws.listeningTopics.length; i++) {
          console.log('Se va a eliminar este nodo del topico ' + JSON.stringify(ws.listeningTopics[i]));
          topics.removeNodeFromTopic(ws.node, ws.listeningTopics[i]);
        }
        nodes.clearNodeSocket(ws.node);
        nodes.broadcastToFrontends({event: 'nodeDisconnect', node: nodes.getNodeInfo(ws.node)});
        if(ws.type === 'frontend') {
          nodes.broadcastToFrontends({event: 'nodeDelete', node: nodes.getNodeInfo(ws.node)});
          nodes.deleteNode(ws.node);
        }
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
