'use strict';

angular.module('generatorAngularFullstackApp')
  .factory('Socket', function ($rootScope, $websocket) {
    var masterSocket;
    var masterSocketState;
    var masterSocketInit = function () {
      masterSocket = $websocket('ws://localhost:9000');
      masterSocketState = 'disconnected';
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
        console.log(message.data);

        switch (message.event) {
        case 'sockets_list':
          break;
        case 'topics_list':
          break;
        case 'data':
          console.log('Se recibió el dato %s', message.data);
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
      }
    }
});
