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
      .when('/resize', {
        templateUrl: 'view.html',
        controller: 'ResizeDemoCtrl',
        title: 'resize',
        description: 'This demo showcases widget resizing.'
      })
      .when('/custom-settings', {
        templateUrl: 'view.html',
        controller: 'CustomSettingsDemoCtrl',
        title: 'custom widget settings',
        description: 'This demo showcases overriding the widget settings dialog/modal ' +
          'for the entire dashboard and for a specific widget. Click on the cog of each ' +
          'widget to see the custom modal. \n"configurable widget" has "limit" option in the modal ' +
          'that controls RandomDataModel.'
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
      },
      {
        name: 'resizable',
        templateUrl: 'template/resizable.html',
        attrs: {
          class: 'demo-widget-resizable'
        }
      },
      {
        name: 'fluid',
        directive: 'wt-fluid',
        size: {
          width: '50%',
          height: '250px'
        }
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
      storageId: 'demo_simple'
    };
    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);

  })
  .controller('ResizeDemoCtrl', function ($scope, $interval, $window, widgetDefinitions, defaultWidgets) {
    defaultWidgets = [
      { name: 'fluid' },
      { name: 'resizable' },
      { name: 'random', style: { width: '50%' } },
      { name: 'time', style: { width: '50%' } }
    ];

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      storage: $window.localStorage,
      storageId: 'demo_resize'
    };
    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);
  })
  .controller('ResizableCtrl', function ($scope) {
    $scope.$on('widgetResized', function (event, size) {
      $scope.width = size.width || $scope.width;
      $scope.height = size.height || $scope.height;
    });
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
      lockDefaultLayouts: true,
      defaultLayouts: [
        { title: 'Layout 1', active: true , defaultWidgets: defaultWidgets },
        { title: 'Layout 2', active: false, defaultWidgets: defaultWidgets },
        { title: 'Layout 3', active: false, defaultWidgets: defaultWidgets, locked: false }
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
  .directive('wtFluid', function () {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: 'template/fluid.html',
      scope: true,
      controller: function ($scope) {
        $scope.$on('widgetResized', function (event, size) {
          $scope.width = size.width || $scope.width;
          $scope.height = size.height || $scope.height;
        });
      }
    };
  })
  .factory('RandomDataModel', function ($interval, WidgetDataModel) {
    function RandomDataModel() {
    }

    RandomDataModel.prototype = Object.create(WidgetDataModel.prototype);
    RandomDataModel.prototype.constructor = WidgetDataModel;

    angular.extend(RandomDataModel.prototype, {
      init: function () {
        var dataModelOptions = this.dataModelOptions;
        this.limit = (dataModelOptions && dataModelOptions.limit) ? dataModelOptions.limit : 100;

        this.updateScope('-');
        this.startInterval();
      },

      startInterval: function () {
        $interval.cancel(this.intervalPromise);

        this.intervalPromise = $interval(function () {
          var value = Math.floor(Math.random() * this.limit);
          this.updateScope(value);
        }.bind(this), 500);
      },

      updateLimit: function (limit) {
        this.dataModelOptions = this.dataModelOptions ? this.dataModelOptions : {};
        this.dataModelOptions.limit = limit;
        this.limit = limit;
      },

      destroy: function () {
        WidgetDataModel.prototype.destroy.call(this);
        $interval.cancel(this.intervalPromise);
      }
    });

    return RandomDataModel;
  });

