'use strict';

describe('Controller: NavBarCtrl', function() {

  var $scope, injections;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, $route){
    $scope = $rootScope.$new();

    injections = {
      $scope: $scope,
      $route: $route
    };
    $controller('NavBarCtrl', injections);
  }));

  describe('the controller properties', function() {

    it('should have $route in scope', function() {
      expect($scope.$route).toBeDefined();
    });

  });

});

describe('Factory: widgetDefinitions', function() {

  // load the service's module
  beforeEach(module('app'));

  // instantiate service
  var widgetDefinitions;
  beforeEach(inject(function (_widgetDefinitions_) {
    widgetDefinitions = _widgetDefinitions_;
  }));

  describe('the widgetDefinitions', function() {

    it('should be an array', function() {
      expect(_.isArray(widgetDefinitions)).toBe(true);
      expect(widgetDefinitions.length).toEqual(5);
      expect(widgetDefinitions[0].name).toEqual('random');
      expect(widgetDefinitions[0].directive).toEqual('wt-scope-watch');
      expect(widgetDefinitions[0].attrs).toEqual({value: 'randomValue'});
      expect(widgetDefinitions[1].name).toEqual('time');
      expect(widgetDefinitions[1].directive).toEqual('wt-time');
      expect(widgetDefinitions[2].name).toEqual('datamodel');
      expect(widgetDefinitions[2].directive).toEqual('wt-scope-watch');
      expect(widgetDefinitions[2].dataAttrName).toEqual('value');
      expect(typeof widgetDefinitions[2].dataModelType).toEqual('function')
      expect(widgetDefinitions[3].name).toEqual('resizable');
      expect(widgetDefinitions[3].templateUrl).toEqual('app/template/resizable.html');
      expect(widgetDefinitions[3].attrs).toEqual({class: 'demo-widget-resizable'});
      expect(widgetDefinitions[4].name).toEqual('fluid');
      expect(widgetDefinitions[4].directive).toEqual('wt-fluid');
      expect(widgetDefinitions[4].size).toEqual({width: '50%', height: '250px'});
    });

  });

});

describe('Value: defaultWidgets', function() {

  beforeEach(module('app'));

  var defaultWidgets;
  beforeEach(inject(function(_defaultWidgets_) {
    defaultWidgets = _defaultWidgets_;
  }));

  describe('the defaultWidgets', function() {

    it('should be an array', function() {
      expect(_.isArray(defaultWidgets)).toBe(true);
      expect(defaultWidgets.length).toEqual(5);
      expect(defaultWidgets[0].name).toEqual('random');
      expect(defaultWidgets[1].name).toEqual('time');
      expect(defaultWidgets[2].name).toEqual('datamodel');
      expect(defaultWidgets[3].name).toEqual('random');
      expect(defaultWidgets[3].style).toEqual({width: '50%', minWidth: '39%'});
      expect(defaultWidgets[4].name).toEqual('time');
      expect(defaultWidgets[4].style).toEqual({width: '50%'});
    });

  });

});

describe('Controller: DemoCtrl', function() {

  var $scope, injections;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, $window, $interval){
    $scope = $rootScope.$new();

    injections = {
      $scope: $scope,
      $window: $window,
      $interval: $interval
    };
    $controller('DemoCtrl', injections);
  }));

  describe('the controller properties', function() {

    it('should dashboardOptions in scope', function() {
      expect($scope.randomValue).toBeDefined();
      expect($scope.dashboardOptions.widgetButtons).toBe(true);
      expect($scope.dashboardOptions.widgetDefinitions).toBeDefined();
      expect($scope.dashboardOptions.defaultWidgets).toBeDefined();
      expect($scope.dashboardOptions.storage).toBeDefined();
      expect($scope.dashboardOptions.storageId).toEqual('demo_simple');
    });

    it('should change randomValue', function() {
      var savedValue = $scope.randomValue;
      injections.$interval.flush(500);
      expect($scope.randomValue).not.toEqual(savedValue);

    });

  });

});