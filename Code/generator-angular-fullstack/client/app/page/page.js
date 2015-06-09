'use strict';

angular.module('generatorAngularFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('page', {
        url: '/page/:id',
        templateUrl: 'app/page/page.html',
        controller: 'PageCtrl'
      });
  });
