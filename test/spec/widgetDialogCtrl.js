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

});