'use strict';

angular.module('generatorAngularFullstackApp')
  .factory('Socket', function ($rootScope, $websocket) {
    var masterSocket;
    var topics = {};
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
        case 'topics':
          // topics = message.topics;
          console.log(topics);
          console.log('Se actualizó en service el topic');
          for (var key in topics) {
            if (!(key in message.topics))
              delete topics[key];
          }
          for (var key in message.topics) {
            if (topics[key] === undefined)
              topics[key] = {};
            topics[key].subscribers = message.topics[key].subscribers; 
            topics[key].publishers = message.topics[key].publishers;
            topics[key].type = message.topics[key].type;            
          }
          break;
        case 'data':
          if (topics[message.topic] === undefined)
            topics[message.topic] = {
              subscribers: [],
              publishers: []
            }
          topics[message.topic].data = message.data;
          topics[message.topic].timestamp = message.timestamp;
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
      updateTopics: function () {
        masterSocket.sendJSON({event: 'getTopics'});
      },
      getTopics: function () {
        return topics;
      },
      subscribeTo: function (topic) {
        var msg = {
          event: 'subscribeTo',
          topic: topic
        };
        if (topics[topic] === undefined)
          topics[topic] = {}
        topics[topic].subscribedTo = true;
        masterSocket.send(JSON.stringify(msg));
        
      },
      unsubscribeFrom: function (topic) {
        var msg = {
          event: 'unsubscribeFrom',
          topic: topic
        };
        if (topics[topic].subscribedTo !== undefined)
          topics[topic].subscribedTo = false;
        masterSocket.send(JSON.stringify(msg));
      },
      // topics: function () { return self.topics;},
      topics: topics,
      subscribedTo: subscribedTo,
      publishingTo: publishingTo
    }
});
