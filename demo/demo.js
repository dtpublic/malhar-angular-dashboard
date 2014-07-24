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

angular.module('app', [
    'ngRoute',
    'ui.dashboard',
    'btford.markdown'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'view.html',
        controller: 'DemoCtrl',
        title: 'simple',
        description: 'This is the simplest demo.'
      })
      .when('/custom-settings', {
        templateUrl: 'view.html',
        controller: 'CustomSettingsDemoCtrl',
        title: 'custom widget settings',
        description: 'This demo showcases overriding the widget settings dialog/modal ' +
          'for the entire dashboard and for a specific widget. Click on the cog of each ' +
          'widget to see the custom modal. \nBe sure to click the cog on the "special widget", ' +
          'which has its own custom settings modal.'
      })
      .when('/explicit-saving', {
        templateUrl: 'view.html',
        controller: 'ExplicitSaveDemoCtrl',
        title: 'explicit saving',
        description: 'This demo showcases an option to only save the dashboard state '+
          'explicitly, e.g. by user input. Notice the "all saved" button in the controls ' +
          'updates as you make saveable changes.'
      })
      .when('/layouts', {
        templateUrl: 'layouts.html',
        controller: 'LayoutsDemoCtrl',
        title: 'dashboard layouts',
        description: 'This demo showcases the ability to have "dashboard layouts", ' +
          'meaning the ability to have multiple arbitrary configurations of widgets. For more ' +
          'information, take a look at [issue #31](https://github.com/DataTorrent/malhar-angular-dashboard/issues/31)'
      })
      .when('/layouts/explicit-saving', {
        templateUrl: 'layouts.html',
        controller: 'LayoutsDemoExplicitSaveCtrl',
        title: 'layouts explicit saving',
        description: 'This demo showcases dashboard layouts with explicit saving enabled.'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .controller('NavBarCtrl', function($scope, $route) {
    $scope.$route = $route;
  })
  .factory('widgetDefinitions', function(RandomDataModel) {
    return [
      {
        name: 'random',
        directive: 'wt-scope-watch',
        attrs: {
          value: 'randomValue'
        }
      },
      {
        name: 'time',
        directive: 'wt-time'
      },
      {
        name: 'datamodel',
        directive: 'wt-scope-watch',
        dataAttrName: 'value',
        dataModelType: RandomDataModel
      }
    ];
  })
  .value('defaultWidgets', [
    { name: 'random' },
    { name: 'time' },
    { name: 'datamodel' },
    {
      name: 'random',
      style: {
        width: '50%'
      }
    },
    {
      name: 'time',
      style: {
        width: '50%'
      }
    }
  ])

  .controller('DemoCtrl', function ($scope, $interval, $window, widgetDefinitions, defaultWidgets) {
    
    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      storage: $window.localStorage,
      storageId: 'demo'
    };
    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);

  })
  .controller('CustomSettingsDemoCtrl', function($scope, $interval, $window, widgetDefinitions, defaultWidgets, $templateCache) {

    // Setting templates to be used in this demo
    $templateCache.put('example/custom/template.html', 
     '<div class="modal-header">' + 
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="cancel()">&times;</button>' + 
        '<h3>Custom Settings Dialog for <small>{{widget.title}}</small></h3>' + 
      '</div>' + 
      '<div class="modal-body">' + 
        '<form name="form" novalidate class="form-horizontal">' + 
          '<div class="form-group">' + 
            '<label for="widgetTitle" class="col-sm-2 control-label">Title</label>' + 
            '<div class="col-sm-10">' + 
                '<input type="text" class="form-control" name="widgetTitle" ng-model="result.title">' + 
            '</div>' + 
          '</div>' + 
          '<div ng-if="widget.partialSettingTemplateUrl" ng-include="widget.partialSettingTemplateUrl"></div>' + 
        '</form>' + 
      '</div>' + 
      '<div class="modal-footer">' + 
          '<button type="button" class="btn btn-default" ng-click="cancel()">Cancel</button>' + 
          '<button type="button" class="btn btn-primary" ng-click="ok()">OK</button>' + 
      '</div>' );
  
    $templateCache.put('widget/specific/template.html', 
     '<div class="modal-header">' + 
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="cancel()">&times;</button>' + 
        '<h3>Custom Settings for a special widget</h3>' + 
      '</div>' + 
      '<div class="modal-body">' + 
        '<form name="form" novalidate class="form-horizontal">' + 
          '<p>I am a settings dialog for a "special widget" widget.</p>' +
          '<div class="form-group">' + 
            '<label for="widgetTitle" class="col-sm-2 control-label">Title</label>' + 
            '<div class="col-sm-10">' + 
                '<input type="text" class="form-control" name="widgetTitle" ng-model="result.title">' + 
            '</div>' + 
          '</div>' + 
        '</form>' + 
      '</div>' + 
      '<div class="modal-footer">' + 
          '<button type="button" class="btn btn-default" ng-click="cancel()">fuhget about it</button>' + 
          '<button type="button" class="btn btn-primary" ng-click="ok()">hell yea</button>' + 
      '</div>' );

    // Add an additional widget with setting overrides
    var definitions = widgetDefinitions.concat({
      name: 'special widget',
      directive: 'wt-scope-watch',
      attrs: {
        value: 'randomValue'
      },
      settingsModalOptions: {
        templateUrl: 'widget/specific/template.html',
        controller: 'WidgetSpecificSettingsCtrl',
        backdrop: false
      },
      onSettingsClose: function(result, widget) {
        console.log('Widget-specific settings resolved!');
        jQuery.extend(true, widget, result);
      },
      onSettingsDismiss: function(reason, scope) {
        console.log('Settings have been dismissed: ', reason);
        console.log('Dashboard scope: ', scope);
      }
    });

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: definitions,
      defaultWidgets: defaultWidgets.concat({ name: 'special widget' }),
      storage: $window.localStorage,
      storageId: 'custom-settings',

      // Overrides default $modal options.
      // This can also be set on individual
      // widget definition objects (see above).
      settingsModalOptions: {
        templateUrl: 'example/custom/template.html',
        // We could pass a custom controller name here to be used
        // with the widget settings dialog, but for this demo we
        // will just keep the default.
        // 
        // controller: 'CustomSettingsModalCtrl'
        // 
        // Other options passed to $modal.open can be put here,
        // eg:
        // 
        // backdrop: false,
        // keyboard: false
        // 
        // @see http://angular-ui.github.io/bootstrap/#/modal  <-- heads up: routing on their site was broken as of this writing
      },

      // Called when a widget settings dialog is closed
      // by the "ok" method (i.e., the promise is resolved
      // and not rejected). This can also be set on individual
      // widgets (see above).
      onSettingsClose: function(result, widget, scope) {
        console.log('Settings result: ', result);
        console.log('Widget: ', widget);
        console.log('Dashboard scope: ', scope);
        jQuery.extend(true, widget, result);
      },

      // Called when a widget settings dialog is closed
      // by the "cancel" method (i.e., the promise is rejected
      // and not resolved). This can also be set on individual
      // widgets (see above).
      onSettingsDismiss: function(reason, scope) {
        console.log('Settings have been dismissed: ', reason);
        console.log('Dashboard scope: ', scope);
      }
    };
    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);
  })

  .controller('WidgetSpecificSettingsCtrl', function ($scope, $modalInstance, widget) {
    // add widget to scope
    $scope.widget = widget;

    // set up result object
    $scope.result = jQuery.extend(true, {}, widget);

    $scope.ok = function () {
      console.log('calling ok from widget-specific settings controller!');
      $modalInstance.close($scope.result);
    };

    $scope.cancel = function () {
      console.log('calling cancel from widget-specific settings controller!');
      $modalInstance.dismiss('cancel');
    };
  })

  .controller('ExplicitSaveDemoCtrl', function ($scope, $interval, $window, widgetDefinitions, defaultWidgets) {

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      storage: $window.localStorage,
      storageId: 'explicitSave',
      explicitSave: true
    };
    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);
  })
  .controller('LayoutsDemoCtrl', function($scope, widgetDefinitions, defaultWidgets, LayoutStorage, $interval) {
    $scope.layoutOptions = {
      storageId: 'demo-layouts',
      storage: localStorage,
      storageHash: 'fs4df4d51',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      defaultLayouts: [
        { title: 'Layout 1', active: true , defaultWidgets: defaultWidgets },
        { title: 'Layout 2', active: false, defaultWidgets: defaultWidgets },
        { title: 'Layout 3', active: false, defaultWidgets: defaultWidgets }
      ]
    };
    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);

  })
  .controller('LayoutsDemoExplicitSaveCtrl', function($scope, widgetDefinitions, defaultWidgets, LayoutStorage, $interval) {

    $scope.layoutOptions = {
      storageId: 'demo-layouts-explicit-save',
      storage: localStorage,
      storageHash: 'fs4df4d51',
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      explicitSave: true,
      defaultLayouts: [
        { title: 'Layout 1', active: true , defaultWidgets: defaultWidgets },
        { title: 'Layout 2', active: false, defaultWidgets: defaultWidgets },
        { title: 'Layout 3', active: false, defaultWidgets: defaultWidgets }
      ]
    };
    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);

  })
  .directive('wtTime', function ($interval) {
    return {
      restrict: 'A',
      scope: true,
      replace: true,
      template: '<div>Time<div class="alert alert-success">{{time}}</div></div>',
      link: function (scope) {
        function update() {
          scope.time = new Date().toLocaleTimeString();
        }

        update();

        var promise = $interval(update, 500);

        scope.$on('$destroy', function () {
          $interval.cancel(promise);
        });
      }
    };
  })
  .directive('wtScopeWatch', function () {
    return {
      restrict: 'A',
      replace: true,
      template: '<div>Value<div class="alert alert-info">{{value}}</div></div>',
      scope: {
        value: '=value'
      }
    };
  })
  .factory('RandomDataModel', function ($interval, WidgetDataModel) {
    function RandomDataModel() {
    }

    RandomDataModel.prototype = Object.create(WidgetDataModel.prototype);

    RandomDataModel.prototype.init = function () {
      this.updateScope('-');
      this.intervalPromise = $interval(function () {
        var value = Math.floor(Math.random() * 100);
        this.updateScope(value);
      }.bind(this), 500);
    };

    RandomDataModel.prototype.destroy = function () {
      WidgetDataModel.prototype.destroy.call(this);
      $interval.cancel(this.intervalPromise);
    };

    return RandomDataModel;
  });

