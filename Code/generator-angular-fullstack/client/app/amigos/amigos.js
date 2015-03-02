'use strict';

angular.module('generatorAngularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('amigos', {
        url: '/amigos',
        templateUrl: 'app/amigos/amigos.html',
        controller: 'AmigosCtrl'
      });
  });