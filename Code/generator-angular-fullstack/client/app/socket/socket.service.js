'use strict';

angular.module('generatorAngularFullstackApp')
  .factory('Socket', function ($rootScope, $websocket) {
    var masterSocket;
    var topics = {};
    var nodes = {}
    var subscribedTo = [];
    var publishingTo = [];
    var masterSocketInit = function () {
      masterSocket = $websocket('ws://localhost:9000');
      masterSocket.sendJSON = function (message) {
        masterSocket.send(JSON.stringify(message));
      };
      masterSocket.onOpen(function (message) {
        console.log('se conectó el socket');
        var msg = {
          'event': 'configuration',
          'type': 'frontend',
          'name': 'miNavegador'
        };
        masterSocket.send(msg);
        $rootScope.$broadcast('socket:stateChanged', masterSocket.readyState);
        masterSocket.sendJSON({event: 'getNodes'});
      });
      masterSocket.onClose(function () {
        console.log('se desconectó el socket');
        $rootScope.$broadcast('socket:stateChanged', masterSocket.readyState);
      });
      masterSocket.onMessage(function (message) {
        var message = JSON.parse(message.data);
        switch (message.event) {
        case 'sockets':
          break;
        case 'nodes':
          // topics = message.topics;
          console.log(nodes);
          console.log('Se actualizó en service el node');
          for (var key in nodes) {
            if (!(key in message.nodes))
              delete nodes[key];
          }
          for (var key in message.nodes) {
            if (nodes[key] === undefined)
              nodes[key] = {};
            nodes[key].subscribers = message.nodes[key].subscribers; 
            nodes[key].type = message.nodes[key].type;
            nodes[key].connected = message.nodes[key].connected;
          }
          break;
        case 'data':
          if (nodes[message.node] === undefined)
            nodes[message.node] = {
              subscribers: []
            }
          nodes[message.node].data = message.data;
          nodes[message.node].timestamp = message.timestamp;
          break;
        }
      });
    };

    masterSocketInit();
    
    return {
      masterSocket: masterSocket,
      sendMessage: function (msg) {
        masterSocket.send(msg);
      },
      getState: function () {
        return masterSocket.readyState;
      },
      disconnect: function () {
        masterSocket.close();
      },
      connect: function () {
        masterSocketInit();
      },
      updateNodes: function () {
        console.log('update nodes');
        masterSocket.sendJSON({event: 'getNodes'});
      },
      getNodes: function () {
        return nodes;
      },
      sendDataToNode: function (data, node) {
        var msg = {
          event: 'data',
          node: node,
          data: data
        }
        masterSocket.send(JSON.stringify(msg));
      },
      subscribeTo: function (node) {
        var msg = {
          event: 'subscribeTo',
          node: node
        };
        if (nodes[node] === undefined)
          nodes[node] = {}
        nodes[node].subscribedTo = true;
        masterSocket.send(JSON.stringify(msg));
      },
      unsubscribeFrom: function (node) {
        var msg = {
          event: 'unsubscribeFrom',
          node: node
        };
        if (nodes[node].subscribedTo !== undefined)
          nodes[node].subscribedTo = false;
        masterSocket.send(JSON.stringify(msg));
      },
      // topics: function () { return self.topics;},
      nodes: nodes,
      subscribedTo: subscribedTo,
      publishingTo: publishingTo
    }
});
