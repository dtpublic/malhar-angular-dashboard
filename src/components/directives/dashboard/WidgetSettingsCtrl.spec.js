'use strict';

describe('Controller: WidgetSettingsCtrl', function() {

  var $scope, $uibModalInstance, widget;

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

    // let's mock a widget
    widget = {
      name: 'my-widget',
      title: 'My mock widget'
    };

    $controller('WidgetSettingsCtrl', {
      $scope: $scope,
      $uibModalInstance: $uibModalInstance,
      widget: widget
    });
  }));

  describe('the controller properties', function() {

    it('should have result in scope', function() {
      expect($scope.result.name).toEqual('my-widget');
      expect($scope.result.title).toEqual('My mock widget');
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