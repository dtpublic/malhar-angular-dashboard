'use strict';

describe('Directive: dashboard', function () {

  // load the directive's module
  beforeEach(module('ui.dashboard'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    //TODO
  }));
});