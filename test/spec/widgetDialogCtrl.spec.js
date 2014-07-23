'use strict';

describe('Controller: WidgetDialogCtrl', function() {

    var $scope, widget, tplName, $modalInstance;
    
    beforeEach(module('ui.dashboard'));

    beforeEach(inject(function($rootScope, $controller){
      $scope = $rootScope.$new();
      widget = { title: 'Test Title' };
      tplName = 'some/url/html';
      $modalInstance = {
        close: function() {

        },
        dismiss: function() {

        }
      };
      $controller('WidgetDialogCtrl', {
          $scope: $scope,
          $modalInstance: $modalInstance,
          widget: widget,
          optionsTemplateUrl: tplName
      });
    }));

    it('should add widget to the dialog scope', function() {
      expect($scope.widget).toEqual(widget);   
    });

    it('should set a default templateUrl if none is supplied in the options', inject(function($rootScope, $controller) {
      $scope = $rootScope.$new();
      $controller('WidgetDialogCtrl', {
          $scope: $scope,
          $modalInstance: $modalInstance,
          widget: widget,
          optionsTemplateUrl: undefined
      });
      expect(typeof $scope.optionsTemplateUrl).toEqual('string');
      expect($scope.optionsTemplateUrl.length > 0).toEqual(true);
    }));

    describe('the ok method', function() {
      it('should call close with $scope.result and $scope.widget', function() {
        spyOn($modalInstance, 'close');
        $scope.ok();
        expect($modalInstance.close).toHaveBeenCalled();
        expect($modalInstance.close.calls.argsFor(0)[0] === $scope.result).toEqual(true);
      });
    });

    describe('the cancel method', function() {
      it('should call dismiss', function() {
        spyOn($modalInstance, 'dismiss');
        $scope.cancel();
        expect($modalInstance.dismiss).toHaveBeenCalled();
      });
    });

});