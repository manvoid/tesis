'use strict';

angular.module('generatorAngularFullstackApp')
  .controller('PageCtrl', function ($scope, $stateParams, Socket) {
    $scope.message = 'Hello';
    
    Socket.currentPage[0] = $stateParams.id;
    $scope.currentPage = Socket.currentPage;
    $scope.pages = Socket.pages;
    $scope.data = Socket.data;

    Socket.initWidgetsInPage($scope.currentPage[0]);
    console.log($scope.currentPage);
    console.log($scope.pages);
    console.log($scope.pages[$scope.currentPage[0]]);
  });
