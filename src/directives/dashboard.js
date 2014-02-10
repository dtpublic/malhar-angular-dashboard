'use strict';

angular.module('ui.dashboard', ['ui.bootstrap', 'ui.sortable']);

angular.module('ui.dashboard')
  .directive('dashboard', ['WidgetModel', '$modal', 'DashboardState', function (WidgetModel, $modal, DashboardState) {
    return {
      restrict: 'A',
      templateUrl: 'template/dashboard.html',
      scope: true,
      controller: function ($scope) {
        $scope.sortableOptions = {
          stop: function () {
            //TODO store active widgets in local storage on add/remove/reorder
            $scope.dashboardState.save($scope.widgets);
          },
          handle: '.widget-header'
        };
      },
      link: function (scope, element, attrs) {
        scope.options = scope.$eval(attrs.dashboard);
        scope.defaultWidgets = scope.options.defaultWidgets; // save widgets for reset

        var count = 1;
        var dashboardState = scope.dashboardState = new DashboardState(
          !!scope.options.useLocalStorage,
          scope.defaultWidgets
        );

        scope.addWidget = function (widgetDef) {
          var title = widgetDef.title ? widgetDef.title : ('Widget ' + count++);

          var widget = new WidgetModel(widgetDef, {
            title: title
          });

          scope.widgets.push(widget);
          scope.saveDashboard();
        };

        scope.removeWidget = function (widget) {
          scope.widgets.splice(_.indexOf(scope.widgets, widget), 1);
          scope.saveDashboard();
        };

        scope.openWidgetDialog = function (widget) {
          var options = widget.editModalOptions;

          // use default options when none are supplied by widget
          if (!options) {
            options = {
              templateUrl: 'template/widget-template.html',
              resolve: {
                widget: function () {
                  return widget;
                },
                optionsTemplateUrl: function () {
                  return scope.options.optionsTemplateUrl;
                }
              },
              controller: 'WidgetDialogCtrl'
            };
          }
          var modalInstance = $modal.open(options);

          // Set resolve and reject callbacks for the result promise
          modalInstance.result.then(
            function (result) {
              console.log('widget dialog closed');
              console.log('result: ', result);
              widget.title = result.title;
            },
            function (reason) {
              console.log('widget dialog dismissed: ', reason);

            }
          );

        };

        scope.clear = function () {
          scope.widgets = [];
        };

        scope.addWidgetInternal = function (event, widgetDef) {
          event.preventDefault();
          scope.addWidget(widgetDef);
        };

        scope.saveDashboard = function () {
          dashboardState.save(scope.widgets);
        };

        scope.loadWidgets = function (widgets) {
          scope.defaultWidgets = widgets; // save widgets for reset
          scope.clear();
          _.each(widgets, function (widgetDef) {
            scope.addWidget(widgetDef);
          });
        };

        scope.resetWidgetsToDefault = function () {
          scope.loadWidgets(scope.defaultWidgets);
        };

        // Set default widgets array
        var savedWidgets = dashboardState.load();

        if (savedWidgets) {
          scope.widgets = savedWidgets;
        } else if (scope.defaultWidgets) {
          scope.resetWidgetsToDefault();
        }

        // allow adding widgets externally
        scope.options.addWidget = scope.addWidget;
        scope.options.loadWidgets = scope.loadWidgets;

        // save state
        scope.$on('widgetChanged', function (event) {
          event.stopPropagation();
          scope.saveDashboard();
        });
      }
    };
  }]);