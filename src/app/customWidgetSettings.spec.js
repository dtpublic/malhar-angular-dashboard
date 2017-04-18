'use strict';

describe('Controller: CustomSettingsDemoCtrl', function() {

  var $scope, injections, WidgetDataModel, RandomDataModel;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, $window, _WidgetDataModel_, _RandomDataModel_){
    WidgetDataModel = _WidgetDataModel_;
    RandomDataModel = _RandomDataModel_;

    $scope = $rootScope.$new();

    injections = {
      $scope: $scope,
      $window: $window,
      RandomDataModel: RandomDataModel
    };
    $controller('CustomSettingsDemoCtrl', injections);
  }));

  describe('the controller properties', function() {

    it('should have properties in scope', function() {
      expect($scope.dashboardOptions.widgetButtons).toEqual(true);
      expect($scope.dashboardOptions.widgetDefinitions.length).toEqual(2);
      expect($scope.dashboardOptions.widgetDefinitions[0].name).toEqual('congfigurable widget');
      expect($scope.dashboardOptions.widgetDefinitions[0].directive).toEqual('wt-scope-watch');
      expect($scope.dashboardOptions.widgetDefinitions[0].dataAttrName).toEqual('value');
      expect($scope.dashboardOptions.widgetDefinitions[0].dataModelType).toBeDefined();
      expect($scope.dashboardOptions.widgetDefinitions[0].dataModelOptions.limit).toEqual(10);
      expect($scope.dashboardOptions.widgetDefinitions[0].settingsModalOptions.partialTemplateUrl).toEqual('app/template/configurableWidgetModalOptions.html');
      expect(typeof $scope.dashboardOptions.widgetDefinitions[0].onSettingsClose).toEqual('function');

      expect($scope.dashboardOptions.widgetDefinitions[1].name).toEqual('override modal widget');
      expect($scope.dashboardOptions.widgetDefinitions[1].directive).toEqual('wt-scope-watch');
      expect($scope.dashboardOptions.widgetDefinitions[1].dataAttrName).toEqual('value');
      expect($scope.dashboardOptions.widgetDefinitions[1].dataModelType).toBeDefined();
      expect($scope.dashboardOptions.widgetDefinitions[1].settingsModalOptions.templateUrl).toEqual('app/template/WidgetSpecificSettings.html');
      expect($scope.dashboardOptions.widgetDefinitions[1].settingsModalOptions.controller).toEqual('WidgetSpecificSettingsCtrl');
      expect($scope.dashboardOptions.widgetDefinitions[1].settingsModalOptions.backdrop).toBe(false);
      expect(typeof $scope.dashboardOptions.widgetDefinitions[1].onSettingsClose).toEqual('function');
      expect(typeof $scope.dashboardOptions.widgetDefinitions[1].onSettingsDismiss).toEqual('function');
    });

  });

  describe('the definition onSettingsClose function', function() {

    it('should update the limit', function() {
      var widget = $scope.dashboardOptions.widgetDefinitions[0];
      widget.dataModel = new RandomDataModel();
      widget.dataModel.setup(widget, $scope);
      widget.dataModel.init();
      var result = {
        dataModelOptions: {
          limit: 20
        }
      };
      widget.onSettingsClose(result, widget);
      expect(widget.dataModelOptions.limit).toEqual(20);
    });

    it('should not update the limit', function() {
      var widget = $scope.dashboardOptions.widgetDefinitions[0];
      var result = {
        dataModelOptions: {
          limit: 20
        }
      };
      widget.onSettingsClose(result, widget);
      expect(widget.dataModelOptions.limit).toEqual(10);
    });

    it('should update the title', function() {
      var widget = $scope.dashboardOptions.widgetDefinitions[1];
      widget.dataModel = new RandomDataModel();
      widget.dataModel.setup(widget, $scope);
      widget.dataModel.init();
      var result = {
        title: 'new widget title'
      };
      widget.onSettingsClose(result, widget);
      expect(widget.title).toEqual('new widget title');
    });

    it('should call the settings dismiss', function() {
      expect(function() {
        $scope.dashboardOptions.widgetDefinitions[1].onSettingsDismiss();
      }).not.toThrow();
    });

  });

  describe('the dashboardOptions onSettingsClose function', function() {

    it('should update the title', function() {
      var widget = $scope.dashboardOptions.widgetDefinitions[1];
      widget.dataModel = new RandomDataModel();
      widget.dataModel.setup(widget, $scope);
      widget.dataModel.init();
      var result = {
        title: 'new widget title'
      };
      $scope.dashboardOptions.onSettingsClose(result, widget);
      expect(widget.title).toEqual('new widget title');
    });

    it('should call the settings dismiss', function() {
      expect(function() {
        $scope.dashboardOptions.onSettingsDismiss();
      }).not.toThrow();
    });

  });

});

describe('Controller: WidgetSpecificSettingsCtrl', function() {

  var $scope, uibModalInstance, widget = {};

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();

    uibModalInstance = {
      close: function() {

      },
      dismiss: function() {

      }
    };
    spyOn(uibModalInstance, 'close');
    spyOn(uibModalInstance, 'dismiss');

    // let's mock widget
    $scope.widget = {
      includeUrl: 'app/template/peopleList.html'
    };

    $controller('WidgetSpecificSettingsCtrl', {
      $scope: $scope,
      $uibModalInstance: uibModalInstance,
      widget: widget
    });
  }));

  describe('the controller properties', function() {

    it('should have widget in scope', function() {
      expect($scope.widget).toBeDefined();
      expect($scope.result).toBeDefined();
    });

  });

  describe('the ok function', function() {

    it('should call modal close', function() {
      $scope.ok();
      expect(uibModalInstance.close).toHaveBeenCalled();
    });

  });

  describe('the dismiss function', function() {

    it('should call modal dismiss', function() {
      $scope.cancel();
      expect(uibModalInstance.dismiss).toHaveBeenCalled();
    });

  });

});