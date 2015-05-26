'use strict';

angular.module('generatorAngularFullstackApp')
  .factory('Socket', function ($rootScope, $websocket) {
    var masterSocket;
    var nodes = {};
    var data = {};
    
    var masterSocketInit = function () {
      masterSocket = $websocket('ws://localhost:9000');
      masterSocket.sendJSON = function (message) {
        masterSocket.send(JSON.stringify(message));
      };
      masterSocket.onOpen(function (message) {
        console.log('se conectó el socket');
        var msg = {
          'event': 'configure',
          'type': 'frontend',
          'node': 'miNavegador' 
        };
        masterSocket.send(msg);
        $rootScope.$broadcast('socket:stateChanged', masterSocket.readyState);
        masterSocket.send({event: 'getNodesInfo'});
      });
      masterSocket.onClose(function () {
        console.log('se desconectó el socket');
        $rootScope.$broadcast('socket:stateChanged', masterSocket.readyState);
      });
      masterSocket.onMessage(function (message) {
        var message = JSON.parse(message.data);
        switch (message.event) {
        case 'nodesInfo':
          // topics = message.topics;
          console.log(message.nodes);
          nodes = message.nodes;
          console.log('Se actualizó en service el node');
          // for (var key in nodes) {
          //   if (!(key in message.nodes))
          //     delete nodes[key];
          // }
          // for (var key in message.nodes) {
          //   if (nodes[key] === undefined)
          //     nodes[key] = {};
          //   nodes[key].subscribers = message.nodes[key].subscribers; 
          //   nodes[key].type = message.nodes[key].type;
          //   nodes[key].connected = message.nodes[key].connected;
          // }
          break;
        case 'widgetsInfo':
          break;
        case 'data':
          if (data[message.node] === undefined)
            data[message.node] = {};
          
          for (var elem in data) {
            if (data[message.node][elem] === undefined)
              data[message.node][elem] = {};
            data[message.node][elem].data = message.data[elem];
            data[message.node][elem].timestamp = message.timestamp;
          }
          
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
        masterSocket.sendJSON({event: 'getNodesInfo'});
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
      // subscribeTo: function (node) {
      //   var msg = {
      //     event: 'subscribeTo',
      //     node: node
      //   };
      //   if (nodes[node] === undefined)
      //     nodes[node] = {}
      //   nodes[node].subscribedTo = true;
      //   masterSocket.send(JSON.stringify(msg));
      // },
      // unsubscribeFrom: function (node) {
      //   var msg = {
      //     event: 'unsubscribeFrom',
      //     node: node
      //   };
      //   if (nodes[node].subscribedTo !== undefined)
      //     nodes[node].subscribedTo = false;
      //   masterSocket.send(JSON.stringify(msg));
      // },
      // topics: function () { return self.topics;},
      nodes: nodes
      // subscribedTo: subscribedTo,
      // publishingTo: publishingTo
    }
});
