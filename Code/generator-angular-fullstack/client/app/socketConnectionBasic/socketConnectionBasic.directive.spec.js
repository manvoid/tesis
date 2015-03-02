'use strict';

describe('Directive: socketConnectionBasic', function () {

  // load the directive's module and view
  beforeEach(module('generatorAngularFullstackApp'));
  beforeEach(module('app/socketConnectionBasic/socketConnectionBasic.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<socket-connection-basic></socket-connection-basic>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the socketConnectionBasic directive');
  }));
});