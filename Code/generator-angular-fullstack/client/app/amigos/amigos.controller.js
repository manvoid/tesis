'use strict';

angular.module('generatorAngularFullstackApp')
  .controller('AmigosCtrl', function ($scope, $http, Socket) {

    $scope.remoteData = {};
    $scope.publishersNames = [];

    $scope.topics = Socket.topics;

    $scope.echoTopics = function () {
      console.log(Socket.getTopics());
    };

    $scope.updateTopics = function () {
      // console.log('getTopics');
      Socket.updateTopics();
    };

    $scope.sendSocketsList = function () {
      Socket.sendMessage({event: 'sockets_list'});
    };

    $scope.sendTopicsList = function () {
      Socket.sendMessage({event: 'topics_list'});
    };

    $scope.subscribeTo = function (topic) {
      Socket.subscribeTo(topic);
    };

    $scope.sendData = function () {
      var msg = {
        timestamp: 1111,
        data: Math.random()
      };
      Socket.sendMessage(JSON.stringify(msg));
    };

    $scope.unsubscribeFrom = function (topic) {
      console.log('desuscripcion');
      Socket.unsubscribeFrom(topic);
    };

    // $scope.$on('socket:broadcast', function (event, data) {
    //   console.log('Mensaje recibido');
    //   console.log(data);
    // });

    // $scope.refreshState = function () {
    //   console.log(Socket.getState());
    //   console.log($scope.socketState);
    // };

    $scope.addConfiguration = function (type) {
      console.log('Se va a mandar un mensaje de configuración');
      var msg = {
        'event': 'configuration',
        'type': type,
        'topic': 'encoder',
        'name': 'miCompu'
      };
      Socket.sendMessage(JSON.stringify(msg));
      // Socket.socket.emit('configure', msg);
    };

    // $scope.addConnection = function () {
    //   $http.post('/api/things', {"name": $scope.newPortName, "port": $scope.newPortPort}
    //             ).success(function(data, status, headers, config) {
    //               $scope.connections = data;
    //               console.log("Se recibión la respuesta");
    //               console.log(JSON.stringify(data));
    //             }).error(function(data, status) {
    //               console.log("Existió un error en el post");
    //             });
    // };

    $scope.$on('socket:stateChanged', function (event, data) {
      $scope.socketState = Socket.getState();
    });
  });
