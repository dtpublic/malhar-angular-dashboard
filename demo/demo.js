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
      .otherwise({
        redirectTo: '/'
      });
  })
  .controller('DemoCtrl', function ($scope, $interval) {
    var widgetDefinitions = [
      {
        name: 'time',
        directive: 'wt-time'
      },
      {
        name: 'random',
        directive: 'wt-scope-watch',
        attrs: {
          value: 'randomValue'
        }
      }
    ];

    var defaultWidgets = [
      { name: 'time' },
      { name: 'random' },
      { name: 'time' },
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
    ];

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets
    };

    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);
  })
  .directive('wtTime', function ($interval) {
    return {
      restrict: 'A',
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
  });

