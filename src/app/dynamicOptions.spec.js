'use strict';

describe('Controller: DynamicOptionsCtrl', function() {

  var $scope, injections;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, $window, $timeout){
    $scope = $rootScope.$new();

    // let's mock the $timeout so we can spy on it
    // however, we still want to retain the original $timeout functionality
    // to test for time sensitive operations
    function timeout(fn, delay) {
      $timeout(fn, delay);
    };
    timeout.flush = function(ms) {
      $timeout.flush(ms);
    };

    injections = {
      $scope: $scope,
      $timeout: timeout,
      $window: $window
    };
    spyOn(injections, '$timeout').and.callThrough();
    $controller('DynamicOptionsCtrl', injections);
  }));

  describe('the controller properties', function() {

    it('should have properties in scope', function() {
      expect($scope.style).toEqual('peopleList');
      expect($scope.dashboardOptions.hideToolbar).toEqual(true);
      expect($scope.dashboardOptions.widgetDefinitions.length).toEqual(2);
      expect($scope.dashboardOptions.widgetDefinitions[0].name).toEqual('peopleList');
      expect($scope.dashboardOptions.widgetDefinitions[0].title).toEqual('people list');
      expect($scope.dashboardOptions.widgetDefinitions[0].templateUrl).toEqual('app/template/dynamicOptionsContainer.html');
      expect($scope.dashboardOptions.widgetDefinitions[0].size).toBeDefined();
      expect($scope.dashboardOptions.widgetDefinitions[0].includeUrl).toEqual('app/template/peopleList.html');
      expect($scope.dashboardOptions.widgetDefinitions[1].name).toEqual('peopleThumbnail');
      expect($scope.dashboardOptions.widgetDefinitions[1].title).toEqual('people thumbnail');
      expect($scope.dashboardOptions.widgetDefinitions[1].templateUrl).toEqual('app/template/dynamicOptionsContainer.html');
      expect($scope.dashboardOptions.widgetDefinitions[1].size).toBeDefined();
      expect($scope.dashboardOptions.widgetDefinitions[1].includeUrl).toEqual('app/template/peopleThumbnail.html');
      expect($scope.dashboardOptions.defaultWidgets).toBeDefined();
      expect($scope.dashboardOptions.storage).toBeDefined();
      expect($scope.dashboardOptions.storageId).toEqual('demo_dynamic-options');
    });

  });

  describe('the toggleWidget method', function() {

    it('should change style', function() {
      $scope.toggleWidget();
      expect($scope.style).toEqual('peopleThumbnail');

      $scope.toggleWidget();
      expect($scope.style).toEqual('peopleList');
    });

    it('should change dashboardOptions reference', function() {
      // object for later comparison
      var savedDashboardOptions = $scope.dashboardOptions;
      $scope.toggleWidget();
      injections.$timeout.flush();
      expect(injections.$timeout).toHaveBeenCalled();
      // we want to compare the object reference
      expect(savedDashboardOptions === $scope.dashboardOptions).toBeFalsy();
    });

  });

});

describe('Controller: PeopleCtrl', function() {

  var $scope;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();

    // let's mock widget
    $scope.widget = {
      includeUrl: 'app/template/peopleList.html'
    };

    $controller('PeopleCtrl', { $scope: $scope });
  }));

  describe('the controller properties', function() {

    it('should have people in scope', function() {
      expect($scope.people.length).toEqual(10);
    });

  });

  describe('the toggleTemplate method', function() {

    it('should change the includeUrl', function() {
      $scope.toggleTemplate();
      expect($scope.widget.includeUrl).toEqual('app/template/peopleThumbnail.html');

      $scope.toggleTemplate();
      expect($scope.widget.includeUrl).toEqual('app/template/peopleList.html');
    });

  });

  describe('theremovePerson method', function() {

    it('should remove one person', function() {
      $scope.removePerson($scope.people[2]);
      expect($scope.people.length).toEqual(9);
    });

    it('should not remove anyone', function() {
      $scope.removePerson({ $$hashKey: 'xxx' });
      expect($scope.people.length).toEqual(10);
    });

  });

});