/*
 * Copyright (c) 2014 DataTorrent, Inc. ALL Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

describe('Directive: dashboard', function () {

  var $rootScope, element, childScope, DashboardState;

  // mock UI Sortable
  beforeEach(function () {
    angular.module('ui.sortable', []);
  });

  // load the directive's module
  beforeEach(module('ui.dashboard'));

  beforeEach(inject(function ($compile, _$rootScope_, _DashboardState_) {
    // services
    $rootScope = _$rootScope_;
    DashboardState = _DashboardState_;

    // options
    var widgetDefinitions = [
      {
        name: 'wt-one',
        template: '<div class="wt-one-value">{{2 + 2}}</div>'
      },
      {
        name: 'wt-two',
        template: '<span class="wt-two-value">{{value}}</span>'
      }
    ];
    var defaultWidgets = _.clone(widgetDefinitions);
    $rootScope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets
    };
    $rootScope.value = 10;

    // element setup 
    element = $compile('<div dashboard="dashboardOptions"></div>')($rootScope);
    $rootScope.$digest();
    childScope = element.scope();
  }));

  it('should have toolbar', function () {
    var toolbar = element.find('.btn-toolbar');
    expect(toolbar.length).toEqual(1);
  });

  it('should have UI.Sortable directive', function () {
    var widgetArea = element.find('.dashboard-widget-area');
    expect(widgetArea.attr('ui-sortable')).toBeDefined();
  });

  it('should render widgets', function () {
    var widgets = element.find('.widget');
    expect(widgets.length).toEqual(2);
  });

  it('should evaluate widget expressions', function () {
    var divWidget = element.find('.wt-one-value');
    expect(divWidget.html()).toEqual('4');
  });

  it('should evaluate scope expressions', function () {
    var spanWidget = element.find('.wt-two-value');
    expect(spanWidget.html()).toEqual('10');
  });

  it('should fill options with defaults', function() {
    expect($rootScope.dashboardOptions.stringifyStorage).toEqual(true);
  });

  it('should not overwrite specified options with defaults', inject(function($compile) {
    $rootScope.dashboardOptions.stringifyStorage = false;
    element = $compile('<div dashboard="dashboardOptions"></div>')($rootScope);
    $compile(element)($rootScope);
    $rootScope.$digest();
    expect($rootScope.dashboardOptions.stringifyStorage).toEqual(false);
  }));

  it('should be able to use a different dashboard template', inject(function($compile, $templateCache) {
    $templateCache.put(
      'myCustomTemplate.html',
        '<div>' +
        '<div ui-sortable="sortableOptions" ng-model="widgets">' +
        '<div ng-repeat="widget in widgets" ng-style="widget.style" class="widget-container custom-widget" widget>' +
        '<h3 class="widget-header">' +
        '{{widget.title}}' +
        '<span ng-click="removeWidget(widget);" class="glyphicon glyphicon-remove" ng-if="!options.hideWidgetClose"></span>' +
        '<span ng-click="openWidgetDialog(widget);" class="glyphicon glyphicon-cog" ng-if="!options.hideWidgetOptions"></span>' +
        '</h3>' +
        '<div class="widget-content"></div>' +
        '<div class="widget-ew-resizer" ng-mousedown="grabResizer($event)"></div>' +
        '</div>' +
        '</div>' +
        '</div>'
    );
    var customElement = $compile('<div dashboard="dashboardOptions" template-url="myCustomTemplate.html"></div>')($rootScope);
    $rootScope.$digest();
    expect(customElement.find('.custom-widget').length).toEqual(2);
  }));

  it('should set scope.widgets to an empty array if no defaultWidgets are specified', inject(function($compile) {
    delete $rootScope.dashboardOptions.defaultWidgets;
    var element2 = $compile('<div dashboard="dashboardOptions"></div>')($rootScope);
    $rootScope.$digest();
    var childScope2 = element2.scope();
    expect(childScope2.widgets instanceof Array).toEqual(true);
  }));

  it('should set options.unsavedChangeCount to 0 upon load', function() {
    expect($rootScope.dashboardOptions.unsavedChangeCount).toEqual(0);
  });

  it('should not call saveDashboard on load', inject(function($compile) {
    spyOn(DashboardState.prototype, 'save');
    var s = $rootScope.$new();
    element = $compile('<div dashboard="dashboardOptions"></div>')(s);
    $rootScope.$digest();
    expect(DashboardState.prototype.save).not.toHaveBeenCalled();
  }));

  describe('the sortableOptions', function() {

    it('should exist', function() {
      expect(typeof childScope.sortableOptions).toEqual('object');
    });

    it('should have a stop function that calls $scope.saveDashboard', function() {
      expect(typeof childScope.sortableOptions.stop).toEqual('function');
      spyOn(childScope, 'saveDashboard');
      childScope.sortableOptions.stop();
      expect(childScope.saveDashboard).toHaveBeenCalled();
    });
  });
  
  describe('the addWidget function', function() {

    var widgetCreated, widgetPassed, widgetDefault;

    beforeEach(function() {
      childScope.widgets.push = function(w) {
        widgetCreated = w;
      }
    });
    
    it('should be a function', function() {
      expect(typeof childScope.addWidget).toEqual('function');
    });

    it('should throw if no default widgetDefinition was found', function() {
      spyOn(childScope.widgetDefs, 'getByName').and.returnValue(false);
      function fn () {
        childScope.addWidget({ name: 'notReal' });
      }
      expect(fn).toThrow();
    });

    it('should look to the passed widgetToInstantiate object for the title before anything else', function() {
      spyOn(childScope.widgetDefs, 'getByName').and.returnValue({ title: 'defaultTitle', name: 'A' });
      childScope.addWidget({ title: 'highestPrecedence', name: 'A' });
      expect(widgetCreated.title).toEqual('highestPrecedence');
    });

    it('should use the defaultWidget\'s title second', function() {
      spyOn(childScope.widgetDefs, 'getByName').and.returnValue({ title: 'defaultTitle', name: 'A' });
      childScope.addWidget({ name: 'A' });
      expect(widgetCreated.title).toEqual('defaultTitle');
    });

    it('should call the saveDashboard method (internal)', function() {
      spyOn(childScope.widgetDefs, 'getByName').and.returnValue({ title: 'defaultTitle', name: 'A' });
        spyOn(childScope, 'saveDashboard');
        childScope.addWidget({ name: 'A' });
        expect(childScope.saveDashboard).toHaveBeenCalled();
    });

    describe('@awashbrook Test Case', function() {
      beforeEach(function() {
        spyOn(childScope.widgetDefs, 'getByName').and.returnValue(widgetDefault = {
          "name": "nvLineChartAlpha",
          "directive": "nvd3-line-chart",
          "dataAttrName": "data",
          "attrs": {
            "isArea": true,
            "height": 400,
            "showXAxis": true,
            "showYAxis": true,
            "xAxisTickFormat": "xAxisTickFormat()",
            "interactive": true,
            "useInteractiveGuideline": true,
            "tooltips": true,
            "showLegend": true,
            "noData": "No data for YOU!",
            "color": "colorFunction()",
            "forcey": "[0,2]"
          },
          "dataModelOptions": {
            "params": {
              "from": "-2h",
              "until": "now"
            }
          },
          "style": {
            "width": "400px"
          },
        });
        childScope.addWidget(widgetPassed = {
          "title": "Andy",
          "name": "nvLineChartAlpha",
          "style": {
            "width": "400px"
          },
          "dataModelOptions": {
            "params": {
              "from": "-1h",
              "target": [
              "randomWalk(\"random Andy 1\")",
              "randomWalk(\"random walk 2\")",
              "randomWalk(\"random walk 3\")"
              ]
            }
          },
          "attrs": {
            "height": 400,
            "showXAxis": true,
            "showYAxis": true,
            "xAxisTickFormat": "xAxisTickFormat()",
            "interactive": false,
            "useInteractiveGuideline": true,
            "tooltips": true,
            "showLegend": true,
            "noData": "No data for YOU!",
            "color": "colorFunction()",
            "forcey": "[0,2]",
            "data": "widgetData"
          }
        });
      });

      it('should keep overrides from widgetPassed', function() {
        expect(widgetCreated.attrs.interactive).toEqual(widgetPassed.attrs.interactive);
      });

      it('should fill in default attrs', function() {
        expect(widgetCreated.attrs.isArea).toEqual(widgetDefault.attrs.isArea);
      });

      it('should override deep options in dataModelOptions', function() {
        expect(widgetCreated.dataModelOptions.params.from).toEqual(widgetPassed.dataModelOptions.params.from);
      });

      it('should fill in deep default attrs', function() {
        expect(widgetCreated.dataModelOptions.params.until).toEqual(widgetDefault.dataModelOptions.params.until);
      });
    });

    describe('the doNotSave parameter', function() {
      
      it('should prevent save from being called if set to true', function() {
        spyOn(childScope.widgetDefs, 'getByName').and.returnValue({ title: 'defaultTitle', name: 'A' });
        spyOn(childScope, 'saveDashboard');
        childScope.addWidget({ name: 'A' }, true);
        expect(childScope.saveDashboard).not.toHaveBeenCalled();
      });

    });

  });

  describe('the removeWidget function', function() {
    
    it('should be a function', function() {
      expect(typeof childScope.removeWidget).toEqual('function');
    });

    it('should remove the provided widget from childScope.widgets array', function() {
      var startingLength = childScope.widgets.length;
      var expectedLength = startingLength - 1;

      var widgetToRemove = childScope.widgets[0];
      childScope.removeWidget(widgetToRemove);

      expect(childScope.widgets.length).toEqual(expectedLength);
      expect(childScope.widgets.indexOf(widgetToRemove)).toEqual(-1);
    });

    it('should call saveDashboard', function() {
      spyOn(childScope, 'saveDashboard');
      var widgetToRemove = childScope.widgets[0];
      childScope.removeWidget(widgetToRemove);      
      expect(childScope.saveDashboard).toHaveBeenCalled();
    });

  });

  describe('the saveDashboard function', function() {
    
    it('should be attached to the options object after initialization', function() {
      expect(typeof $rootScope.dashboardOptions.saveDashboard).toEqual('function');
      expect($rootScope.dashboardOptions.saveDashboard === childScope.externalSaveDashboard).toEqual(true);
    });

    it('should call scope.dashboardState.save when called internally if explicitSave is falsey', function() {
      spyOn(childScope.dashboardState, 'save').and.returnValue(true);
      childScope.saveDashboard();
      expect(childScope.dashboardState.save).toHaveBeenCalled();
    });

    it('should not call scope.dashboardState.save when called internally if explicitSave is truthy', function() {
      $rootScope.dashboardOptions.explicitSave = true;
      spyOn(childScope.dashboardState, 'save').and.returnValue(true);
      childScope.saveDashboard();
      expect(childScope.dashboardState.save).not.toHaveBeenCalled();
    });

    it('should call scope.dashboardState.save when called externally, no matter what explicitSave value is', function() {
      spyOn(childScope.dashboardState, 'save').and.returnValue(true);

      $rootScope.dashboardOptions.explicitSave = false;
      $rootScope.dashboardOptions.saveDashboard();
      expect(childScope.dashboardState.save.calls.count()).toEqual(1);

      $rootScope.dashboardOptions.explicitSave = true;
      $rootScope.dashboardOptions.saveDashboard();
      expect(childScope.dashboardState.save.calls.count()).toEqual(2);
    });

    it('should keep a count of unsaved changes as unsavedChangeCount', function() {
      $rootScope.dashboardOptions.explicitSave = true;
      spyOn(childScope.dashboardState, 'save').and.returnValue(true);
      childScope.saveDashboard();
      expect($rootScope.dashboardOptions.unsavedChangeCount).toEqual(1);
      childScope.saveDashboard();
      childScope.saveDashboard();
      expect($rootScope.dashboardOptions.unsavedChangeCount).toEqual(3);
    });

    it('should reset the cound of unsaved changes if a successful force save occurs', function() {
      $rootScope.dashboardOptions.explicitSave = true;
      spyOn(childScope.dashboardState, 'save').and.returnValue(true);

      childScope.saveDashboard();
      childScope.saveDashboard();
      childScope.saveDashboard();

      childScope.saveDashboard(true);

      expect($rootScope.dashboardOptions.unsavedChangeCount).toEqual(0);
    });

  });

  describe('the loadWidgets function', function() {
    
    it('should be a function', function() {
      expect(typeof childScope.loadWidgets).toEqual('function');
    });

    it('should set savedWidgetDefs on scope as passed array', function() {
      var widgets = [];
      childScope.loadWidgets(widgets);
      expect(childScope.savedWidgetDefs === widgets).toEqual(true);
    });

    it('should call clear on the scope with true as the only argument', function() {
      spyOn(childScope, 'clear');
      childScope.loadWidgets([]);
      expect(childScope.clear).toHaveBeenCalled();
      expect(childScope.clear.calls.argsFor(0)).toEqual([true]);
    });

    it('should call addWidget for each widget in the array', function() {
      spyOn(childScope, 'addWidget').and.returnValue(null);
      var widgets = [{},{},{}];
      childScope.loadWidgets(widgets);
      expect(childScope.addWidget.calls.count()).toEqual(3);
    });

    it('should call addWidget for each widget with true as the second parameter (doNotSave)', function() {
      spyOn(childScope, 'addWidget').and.returnValue(null);
      var widgets = [{},{},{}];
      childScope.loadWidgets(widgets);
      expect(childScope.addWidget.calls.argsFor(0)).toEqual( [ widgets[0], true] );
      expect(childScope.addWidget.calls.argsFor(1)).toEqual( [ widgets[1], true] );
      expect(childScope.addWidget.calls.argsFor(2)).toEqual( [ widgets[2], true] );
    });

  });

  describe('the clear function', function() {
    
    it('should set the scope to an empty array', function() {
      childScope.clear();
      expect(childScope.widgets).toEqual([]);
    });

    it('should not call saveDashboard if first arg is true', function() {
      spyOn(childScope, 'saveDashboard');
      childScope.clear(true);
      expect(childScope.saveDashboard).not.toHaveBeenCalled();
    });

    it('should call saveDashboard if first arg is not true', function() {
      spyOn(childScope, 'saveDashboard');
      childScope.clear();
      expect(childScope.saveDashboard).toHaveBeenCalled();
    });

  });

});
