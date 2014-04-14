'use strict';

angular.module('ui.dashboard', ['ui.bootstrap', 'ui.sortable']);

angular.module('ui.dashboard')
  .directive('dashboard', ['WidgetModel', 'WidgetDefCollection', '$modal', 'DashboardState', function (WidgetModel, WidgetDefCollection, $modal, DashboardState) {
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
        // Extract options the dashboard="" attribute
        scope.options = scope.$eval(attrs.dashboard);

        // Save default widget config for reset
        scope.defaultWidgets = scope.options.defaultWidgets; 
        
        //scope.widgetDefs = scope.options.widgetDefinitions;
        scope.widgetDefs = new WidgetDefCollection(scope.options.widgetDefinitions);
        var count = 1;

        // Instantiate new instance of dashboard state
        var dashboardState = scope.dashboardState = new DashboardState(
          !!scope.options.useLocalStorage,
          scope.defaultWidgets
        );

        /**
         * Instantiates a new widget on the dashboard
         * @param {Object} widgetDef The definition object of the widget
         */
        scope.addWidget = function (widgetDef) {
          var wDef = scope.widgetDefs.getByName(widgetDef.name);
          if (!wDef) {
            throw 'Widget ' + widgetDef.name + ' is not found.';
          }

          var title;
          if (widgetDef.title) {
            title = widgetDef.title;
          } else if (wDef.title) {
            title = wDef.title;
          } else {
            title = 'Widget ' + count++;
          }

          var w = angular.copy(wDef);
          angular.extend(w, widgetDef); //TODO deep extend

          var widget = new WidgetModel(w, {
            title: title
          });

          scope.widgets.push(widget);
          scope.saveDashboard();
        };

        /**
         * Removes a widget instance from the dashboard
         * @param  {Object} widget The widget instance object (not a definition object)
         */
        scope.removeWidget = function (widget) {
          scope.widgets.splice(_.indexOf(scope.widgets, widget), 1);
          scope.saveDashboard();
        };

        /**
         * Opens a dialog for setting and changing widget properties
         * @param  {Object} widget The widget instance object
         */
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

        /**
         * Remove all widget instances from dashboard
         */
        scope.clear = function () {
          scope.widgets = [];
        };

        /**
         * Used for preventing default on click event
         * @param {Object} event     A click event
         * @param {Object} widgetDef A widget definition object
         */
        scope.addWidgetInternal = function (event, widgetDef) {
          event.preventDefault();
          scope.addWidget(widgetDef);
        };

        /**
         * Uses dashboardState service to save state
         */
        scope.saveDashboard = function () {
          dashboardState.save(scope.widgets);
        };

        /**
         * Clears current dash and instantiates widget definitions
         * @param  {Array} widgets Array of definition objects
         */
        scope.loadWidgets = function (widgets) {
          scope.defaultWidgets = widgets; // save widgets for reset
          scope.clear();
          _.each(widgets, function (widgetDef) {
            scope.addWidget(widgetDef);
          });
        };

        /**
         * Resets widget instances to default config
         * @return {[type]} [description]
         */
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