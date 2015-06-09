'use strict';

angular.module('generatorAngularFullstackApp')
  .factory('Socket', function ($rootScope, $websocket) {
    var masterSocket;
    var nodes = {};
    var scripts = {};
    var data = {};
    var pages = [];
    var currentPage = [-1];
    
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
        // console.log(message);
        var message = JSON.parse(message.data);
        switch (message.event) {
        case 'nodesInfo':
          for (var node in nodes) {
            if (!(node in message.nodes))
              delete nodes[node];
          }
          for (var node in message.nodes) {
            if (nodes[node] === undefined)
              nodes[node] = message.nodes[node];
          }
          break;
        case 'scriptsInfo':
          for (var script in scripts) {
            if (!(script in message.scripts))
              delete scripts[script];
          }
          for (var script in message.scripts) {
            if (scripts[script] === undefined)
              scripts[script] = message.scripts[script];
          }
          console.log(scripts);
          break;
        case 'data':
          var topic = message.data.topic;
          var value = message.data.value;
          if (data[topic.node] === undefined)
            data[topic.node] = {};
          data[topic.node][topic.name] = value;
          break;
        case 'nodeDisconnect':
          if (nodes[message.node.node] !== undefined)
            nodes[message.node.node].isConnected = false;
          break;
        case 'nodeConnect':
          if (nodes[message.node.node] !== undefined)
            nodes[message.node.node].isConnected = true;
          else
            nodes[message.node.node] = message.node;
          break;
        case 'nodeDelete':
          if (nodes[message.node.node] !== undefined)
            delete nodes[message.node.node];
          break;
        case 'scriptDisconnect':
          console.log(message.script.script);
          if (scripts[message.script.script] !== undefined)
            scripts[message.script.script].isRunning = false;
          break;
        case 'scriptConnect':
          console.log('conectando script');
          console.log(message);
          if (scripts[message.script.script] !== undefined)
            scripts[message.script.script].isRunning = true;
          else
            scripts[message.script.script] = message.script;
          break;
        case 'pagesInfo':
          for (var page=0; page<message.pages.length; page++) {
            pages[page] = message.pages[page];
          }
          if (currentPage[0] !== -1) {
            var msg = {
              event: 'initWidgetsInPage',
              page: currentPage[0] || 0
            };
            masterSocket.send(JSON.stringify(msg));
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
      updateScripts: function () {
        console.log('update scripts');
        masterSocket.sendJSON({event: 'getScriptsInfo'});
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
      createListenScript: function (node, data) {
        var msg = {
          event: 'createListenScript',
          node: node,
          data: data
        };
        masterSocket.send(JSON.stringify(msg));
      },
      listenTopic: function (topic) {
        var msg = {
          event: 'listenTopic',
          topic: topic
        };
        // console.log(JSON.stringify(msg));
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
      nodes: nodes,
      scripts: scripts,
      data: data,
      pages: pages,
      currentPage: currentPage,
      setCurrentPage: function (page) {
        currentPage[0] = page;
      },
      initWidgetsInPage: function (page) {
        console.log('Solicitud de inicio de sockets en ' + page);
        var msg = {
          event: 'initWidgetsInPage',
          page: page || 0
        };
        masterSocket.send(JSON.stringify(msg));
      }
    }
});
