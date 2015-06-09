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

    $scope.pages = Socket.pages;
    $scope.currentPage;

    $scope.isCollapsed = true;

    var changeSocketState = function (state) {
      if (state === 1)
        $scope.socketState = 'Connected';
      else if (state === 0)
        $scope.socketState = 'Connecting';
      else if (state === 3)
        $scope.socketState = 'Disconnected';
      else
        $scope.socketState = 'What!?';
    };

    changeSocketState(Socket.getState());

    $scope.$on('socket:stateChanged', function (event, data) {
      changeSocketState(data);
      $scope.$apply();
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

    $scope.isPageActive = function (page) {
      return page === $location.path();
    };

    $scope.setCurrentPage = function (page) {
      $scope.currentPage = page;
      Socket.setCurrentPage(page);
    };
  });
