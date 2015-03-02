'use strict';

angular.module('generatorAngularFullstackApp')
  .controller('NavbarCtrl', function ($scope, $location, Socket) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    },{
      'title': 'Amigos',
      'link': '/amigos'
    }];

    $scope.isCollapsed = true;

    $scope.socketState = Socket.getState();
    $scope.$on('socket:stateChanged', function (event, data) {
      $scope.socketState = Socket.getState();
    });

    $scope.socketConnect = function () {
      Socket.connect();
    };

    $scope.socketDisconnect = function () {
      Socket.disconnect();
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
