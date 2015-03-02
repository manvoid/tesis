'use strict';

describe('Controller: AmigosCtrl', function () {

  // load the controller's module
  beforeEach(module('generatorAngularFullstackApp'));

  var AmigosCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AmigosCtrl = $controller('AmigosCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
