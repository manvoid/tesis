'use strict';

angular.module('generatorAngularFullstackApp')
  .factory('Socket', function ($rootScope, socketFactory) {
    var socket;
    var state;
    var socketInit = function () {
      socket = socketFactory();
      state = 'disconnected';
      socket.forward('broadcast');
      socket.on('connect', function (socket) {
        state = 'connected';
        $rootScope.$broadcast('socket:stateChanged', "hola");
      });
      socket.on('disconnect', function (socket) {
        if(state !== 'disconnected') {
          state = 'disconnected';
          $rootScope.$broadcast('socket:stateChanged', "hola");
        }
      });
    };
    socketInit();
    return {
      socket: socket,
      getState: function () {
        return state;
      },
      disconnect: function () {
        socket.disconnect();
        state = 'disconnected';
        $rootScope.$broadcast('socket:stateChanged', "hola");
      },
      connect: function () {
        socket.connect();
        state = 'connected';
        $rootScope.$broadcast('socket:stateChanged', "hola");
      }
    }
});
