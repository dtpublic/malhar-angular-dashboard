'use strict';

describe('Controller: SaveChangesModalCtrl', function() {

  var $scope, $uibModalInstance, layout;

  beforeEach(module('ui.dashboard'));

  beforeEach(inject(function($rootScope, $controller){
    $scope = $rootScope.$new();

    // let's mock $uibModalInstance
    $uibModalInstance = {
      close: function() {},
      dismiss: function() {}
    };
    spyOn($uibModalInstance, 'close');
    spyOn($uibModalInstance, 'dismiss');

    // let's mock a layout
    layout = {
      name: 'my-layout',
      title: 'My mock layout'
    };

    $controller('SaveChangesModalCtrl', {
      $scope: $scope,
      $uibModalInstance: $uibModalInstance,
      layout: layout
    });
  }));

  describe('the controller properties', function() {

    it('should have layout in scope', function() {
      expect($scope.layout.name).toEqual('my-layout');
      expect($scope.layout.title).toEqual('My mock layout');
    });

    it('should call the close function', function() {
      $scope.ok();
      expect($uibModalInstance.close).toHaveBeenCalled();
    })

    it('should call the dismiss function', function() {
      $scope.cancel();
      expect($uibModalInstance.dismiss).toHaveBeenCalled();
    })

  });

});