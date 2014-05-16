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
    'ui.dashboard'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'view.html',
        controller: 'DemoCtrl'
      })
      .when('/explicit-saving', {
        templateUrl: 'view.html',
        controller: 'ExplicitSaveDemoCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
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

    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);
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

