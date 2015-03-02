'use strict';

angular.module('generatorAngularFullstackApp')
  .controller('AmigosCtrl', function ($scope, Socket) {

    // console.log(Socket.getState());

    $scope.socketState = Socket.getState();
    // $scope.socket = Socket;

    $scope.sendMessage = function () {
      console.log('Se presionó el botón');
      Socket.socket.emit('message', {'hola': 'mundo'});
    };

    $scope.$on('socket:broadcast', function (event, data) {
      console.log('Mensaje recibido');
      console.log(data);
    });

    $scope.socketConnect = function () {
      Socket.connect();
    };

    $scope.socketDisconnect = function () {
      Socket.disconnect();
    };

    $scope.refreshState = function () {
      console.log(Socket.getState());
      console.log($scope.socketState);
    };

    $scope.$on('socket:stateChanged', function (event, data) {
      $scope.socketState = Socket.getState();
    });
  });
