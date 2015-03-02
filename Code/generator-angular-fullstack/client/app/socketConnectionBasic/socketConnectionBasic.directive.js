'use strict';

angular.module('generatorAngularFullstackApp')
  .directive('socketConnectionBasic', function () {
    return {
      templateUrl: 'app/socketConnectionBasic/socketConnectionBasic.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        // console.log("Este es el elemento que estoy describiendo");
        // console.log(element);
        // console.log(element.find('input'));
        // console.log(scope.data);
        // element.find('input').attr('id', 'inputo');
        element.find('input').value = "hola";
      },
      scope: {
        name: '@',
        port: '@',
        data: '@'
      }
    };
  });
