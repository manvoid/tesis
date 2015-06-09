'use strict';

angular.module('generatorAngularFullstackApp')
  .controller('AmigosCtrl', function ($scope, $http, Socket) {

    $scope.remoteData = {};
    $scope.publishersNames = [];

    $scope.nodes = Socket.nodes;
    $scope.widgets = Socket.widgets;
    $scope.data = Socket.data;

    $scope.echoTopics = function () {
      console.log(Socket.getTopics());
    };

    $scope.updateNodes = function () {
      // console.log('getTopics');
      Socket.updateNodes();
      //$scope.nodes = Socket.getNodes();
    };

    $scope.createListenWidget = function (node, data) {
      Socket.createListenWidget(node, data);
    };

    $scope.updateScripts = function () {
      Socket.updateScripts();
    };

    $scope.listenTopic = function (topic) {
      Socket.listenTopic(topic);
    };

    $scope.sendTopicsList = function () {
      Socket.sendMessage({event: 'topics_list'});
    };

    $scope.sendDataToNode = function (data, node) {
      console.log('sisi');
      Socket.sendDataToNode(data, node);
    };

    $scope.subscribeTo = function (node) {
      Socket.subscribeTo(node);
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
