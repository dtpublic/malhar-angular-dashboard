'use strict';

describe('Controller: LayoutsDemoCtrl', function() {

  var $scope, injections;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, $window, $interval){
    $scope = $rootScope.$new();

    injections = {
      $scope: $scope,
      $interval: $interval
    };
    $controller('LayoutsDemoCtrl', injections);
  }));

  describe('the controller properties', function() {

    it('should have properties in scope', function() {
      expect($scope.randomValue).toBeDefined();
      expect($scope.layoutOptions.storageId).toEqual('demo-layouts');
      expect($scope.layoutOptions.storage).toBeDefined();
      expect($scope.layoutOptions.storageHash).toEqual('fs4df4d51');
      expect($scope.layoutOptions.widgetDefinitions).toBeDefined();
      expect($scope.layoutOptions.defaultWidgets).toBeDefined();
      expect($scope.layoutOptions.lockDefaultLayouts).toBe(true);
      expect($scope.layoutOptions.defaultLayouts.length).toEqual(3);
      expect($scope.layoutOptions.defaultLayouts[0].title).toEqual('Layout 1');
      expect($scope.layoutOptions.defaultLayouts[0].active).toBe(true);
      expect($scope.layoutOptions.defaultLayouts[0].defaultWidgets).toBeDefined();
      expect($scope.layoutOptions.defaultLayouts[1].title).toEqual('Layout 2');
      expect($scope.layoutOptions.defaultLayouts[1].active).toBe(false);
      expect($scope.layoutOptions.defaultLayouts[1].defaultWidgets).toBeDefined();
      expect($scope.layoutOptions.defaultLayouts[2].title).toEqual('Layout 3');
      expect($scope.layoutOptions.defaultLayouts[2].active).toBe(false);
      expect($scope.layoutOptions.defaultLayouts[2].defaultWidgets).toBeDefined();
      expect($scope.layoutOptions.defaultLayouts[2].locked).toBe(false);
    });

    it('should change randomValue', function() {
      var savedValue = $scope.randomValue;
      injections.$interval.flush(500);
      expect($scope.randomValue).not.toEqual(savedValue);
    });

  });

});

describe('Controller: LayoutsDemoExplicitSaveCtrl', function() {

  var $scope, $interval;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, _$interval_) {
    $interval = _$interval_;

    $scope = $rootScope.$new();

    $controller('LayoutsDemoExplicitSaveCtrl', {
      $scope: $scope,
      $interval: $interval
    });
  }));

  describe('the controller properties', function() {

    it('should have properties in scope', function() {
      expect($scope.randomValue).toBeDefined();
      expect($scope.layoutOptions.storageId).toEqual('demo-layouts-explicit-save');
      expect($scope.layoutOptions.storage).toBeDefined();
      expect($scope.layoutOptions.storageHash).toEqual('fs4df4d51');
      expect($scope.layoutOptions.widgetDefinitions).toBeDefined();
      expect($scope.layoutOptions.defaultWidgets).toBeDefined();
      expect($scope.layoutOptions.explicitSave).toBe(true);
      expect($scope.layoutOptions.defaultLayouts.length).toEqual(3);
      expect($scope.layoutOptions.defaultLayouts[0].title).toEqual('Layout 1');
      expect($scope.layoutOptions.defaultLayouts[0].active).toBe(true);
      expect($scope.layoutOptions.defaultLayouts[0].defaultWidgets).toBeDefined();
      expect($scope.layoutOptions.defaultLayouts[1].title).toEqual('Layout 2');
      expect($scope.layoutOptions.defaultLayouts[1].active).toBe(false);
      expect($scope.layoutOptions.defaultLayouts[1].defaultWidgets).toBeDefined();
      expect($scope.layoutOptions.defaultLayouts[2].title).toEqual('Layout 3');
      expect($scope.layoutOptions.defaultLayouts[2].active).toBe(false);
      expect($scope.layoutOptions.defaultLayouts[2].defaultWidgets).toBeDefined();
    });

    it('should change randomValue', function() {
      var savedValue = $scope.randomValue;
      $interval.flush(500);
      expect($scope.randomValue).not.toEqual(savedValue);
    });

  });

});