'use strict';

describe('Controller: ExplicitSaveDemoCtrl', function() {

  var $scope, injections;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, $window, $interval){
    $scope = $rootScope.$new();

    injections = {
      $scope: $scope,
      $window: $window,
      $interval: $interval
    };
    $controller('ExplicitSaveDemoCtrl', injections);
  }));

  describe('the controller properties', function() {

    it('should have properties in scope', function() {
      expect($scope.randomValue).toBeDefined();
      expect($scope.dashboardOptions.widgetButtons).toBe(true);
      expect($scope.dashboardOptions.widgetDefinitions).toBeDefined();
      expect($scope.dashboardOptions.defaultWidgets).toBeDefined();
      expect($scope.dashboardOptions.storage).toBeDefined();
      expect($scope.dashboardOptions.storageId).toEqual('explicitSave');
      expect($scope.dashboardOptions.explicitSave).toBe(true);
    });

    it('should change randomValue', function() {
      var savedValue = $scope.randomValue;
      injections.$interval.flush(500);
      expect($scope.randomValue).not.toEqual(savedValue);
    });

  });

});