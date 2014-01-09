'use strict';

angular.module('ui.dashboard', ['ui.bootstrap', 'ui.sortable']);

angular.module('ui.dashboard')
  .directive('dashboard', function () {
    return {
      restrict: 'A',
      templateUrl: 'template/dashboard.html',
      scope: true,
      controller: function ($scope) {
        $scope.sortableOptions = {
          stop: function () {
            //TODO store active widgets in local storage on add/remove/reorder
            //var titles = _.map($scope.widgets, function (widget) {
            //  return widget.title;
            //});
            //console.log(titles);
          }
        };
      },
      link: function (scope, element, attrs) {
        scope.options = scope.$eval(attrs.dashboard);

        var count = 1;

        scope.addWidget = function (directive, attrs, style) {
          scope.widgets.push({
            title: 'Widget ' + count++,
            directive: directive,
            attrs: attrs,
            style: style
          });
        };

        scope.removeWidget = function (widget) {
          scope.widgets.splice(_.indexOf(scope.widgets, widget), 1);
        };

        scope.clear = function () {
          scope.widgets = [];
        };

        scope.widgets = [];
        _.each(scope.options.defaultWidgets, function (widgetDefinition) {
          scope.addWidget(widgetDefinition.directive, widgetDefinition.attrs, widgetDefinition.style);
        });

        scope.addWidgetInternal = function (event, widget) {
          event.preventDefault();
          scope.addWidget(widget.directive, widget.attrs);
        };

        // allow adding widgets externally
        scope.options.addWidget = scope.addWidget;
      }
    };
  })
  .directive('widget', ['$compile', function ($compile) {
    return {
      require: '^dashboard',
      link: function (scope, element) {
        var elm = element.find('.widget-content > div');

        var widget = scope.widget;
        elm.attr(widget.directive, '');

        if (widget.attrs) {
          _.each(widget.attrs, function (value, attr) {
            elm.attr(attr, value);
          });
        }

        $compile(elm)(scope);
      }
    };
  }]);