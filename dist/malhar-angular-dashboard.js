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

angular.module('ui.dashboard', ['ui.bootstrap', 'ui.sortable']);

angular.module('ui.dashboard')

  .directive('dashboard', ['WidgetModel', 'WidgetDefCollection', '$uibModal', 'DashboardState', '$log', function (WidgetModel, WidgetDefCollection, $uibModal, DashboardState, $log) {

    return {
      restrict: 'A',
      templateUrl: function(element, attr) {
        return attr.templateUrl ? attr.templateUrl : 'components/directives/dashboard/dashboard.html';
      },
      scope: true,

      controller: ['$scope', '$attrs', function (scope, attrs) {
        // default options
        var defaults = {
          stringifyStorage: true,
          hideWidgetSettings: false,
          hideWidgetClose: false,
          settingsModalOptions: {
            templateUrl: 'components/directives/dashboard/widget-settings-template.html',
            controller: 'WidgetSettingsCtrl'
          },
          onSettingsClose: function(result, widget) { // NOTE: dashboard scope is also passed as 3rd argument
            jQuery.extend(true, widget, result);
          },
          onSettingsDismiss: function(reason) { // NOTE: dashboard scope is also passed as 2nd argument
            $log.info('widget settings were dismissed. Reason: ', reason);
          }
        };

        // from dashboard="options"
        scope.options = scope.$eval(attrs.dashboard);

        // Ensure settingsModalOptions exists on scope.options
        scope.options.settingsModalOptions = scope.options.settingsModalOptions !== undefined ? scope.options.settingsModalOptions : {};
        // Set defaults
        _.defaults(scope.options.settingsModalOptions, defaults.settingsModalOptions);

        // Shallow options
        _.defaults(scope.options, defaults);

        // sortable options
        var sortableDefaults = {
          stop: function () {
            scope.saveDashboard();
          },
          handle: '.widget-header',
          distance: 5
        };
        scope.sortableOptions = angular.extend({}, sortableDefaults, scope.options.sortableOptions || {});

      }],
      link: function (scope) {

        // Save default widget config for reset
        scope.defaultWidgets = scope.options.defaultWidgets;

        scope.widgetDefs = new WidgetDefCollection(scope.options.widgetDefinitions);
        var count = 1;

        // Instantiate new instance of dashboard state
        scope.dashboardState = new DashboardState(
          scope.options.storage,
          scope.options.storageId,
          scope.options.storageHash,
          scope.widgetDefs,
          scope.options.stringifyStorage
        );


        function getWidget(widgetToInstantiate) {
          if (typeof widgetToInstantiate === 'string') {
            widgetToInstantiate = {
              name: widgetToInstantiate
            };
          }

          var defaultWidgetDefinition = scope.widgetDefs.getByName(widgetToInstantiate.name);
          if (!defaultWidgetDefinition) {
            throw 'Widget ' + widgetToInstantiate.name + ' is not found.';
          }

          // Determine the title for the new widget
          var title;
          if (!widgetToInstantiate.title && !defaultWidgetDefinition.title) {
            widgetToInstantiate.title = 'Widget ' + count++;
          }

          // Instantiation
          return new WidgetModel(defaultWidgetDefinition, widgetToInstantiate);
        }


        /**
         * Instantiates a new widget and append it the dashboard
         * @param {Object} widgetToInstantiate The definition object of the widget to be instantiated
         */
        scope.addWidget = function (widgetToInstantiate, doNotSave) {
          var widget = getWidget(widgetToInstantiate);

          // Add to the widgets array
          scope.widgets.push(widget);
          if (!doNotSave) {
            scope.saveDashboard();
          }

          return widget;
        };

        /**
         * Instantiates a new widget and insert it a beginning of dashboard
         */
        scope.prependWidget = function(widgetToInstantiate, doNotSave) {
          var widget = getWidget(widgetToInstantiate);

          // Add to the widgets array
          scope.widgets.unshift(widget);
          if (!doNotSave) {
            scope.saveDashboard();
          }

          return widget;
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
        scope.openWidgetSettings = function (widget) {

          // Set up $uibModal options 
          var options = _.defaults(
            { scope: scope },
            widget.settingsModalOptions,
            scope.options.settingsModalOptions);

          // Ensure widget is resolved
          options.resolve = {
            widget: function () {
              return widget;
            }
          };
          
          // Create the modal
          var modalInstance = $uibModal.open(options);
          var onClose = widget.onSettingsClose || scope.options.onSettingsClose;
          var onDismiss = widget.onSettingsDismiss || scope.options.onSettingsDismiss;

          // Set resolve and reject callbacks for the result promise
          modalInstance.result.then(
            function (result) {

              // Call the close callback
              onClose(result, widget, scope);

              //AW Persist title change from options editor
              scope.$emit('widgetChanged', widget);
            },
            function (reason) {
              
              // Call the dismiss callback
              onDismiss(reason, scope);

            }
          );

        };

        /**
         * Remove all widget instances from dashboard
         */
        scope.clear = function (doNotSave) {
          scope.widgets = [];
          if (doNotSave === true) {
            return;
          }
          scope.saveDashboard();
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
        scope.saveDashboard = function (force) {
          if (!scope.options.explicitSave) {
            scope.dashboardState.save(scope.widgets);
          } else {
            if (!angular.isNumber(scope.options.unsavedChangeCount)) {
              scope.options.unsavedChangeCount = 0;
            }
            if (force) {
              scope.options.unsavedChangeCount = 0;
              scope.dashboardState.save(scope.widgets);

            } else {
              ++scope.options.unsavedChangeCount;
            }
          }
        };

        /**
         * Wraps saveDashboard for external use.
         */
        scope.externalSaveDashboard = function(force) {
          if (angular.isDefined(force)) {
            scope.saveDashboard(force);
          } else {
            scope.saveDashboard(true);
          }
        };

        /**
         * Clears current dash and instantiates widget definitions
         * @param  {Array} widgets Array of definition objects
         */
        scope.loadWidgets = function (widgets) {
          // AW dashboards are continuously saved today (no "save" button).
          //scope.defaultWidgets = widgets;
          scope.savedWidgetDefs = widgets;
          scope.clear(true);
          _.each(widgets, function (widgetDef) {
            scope.addWidget(widgetDef, true);
          });
        };

        /**
         * Resets widget instances to default config
         * @return {[type]} [description]
         */
        scope.resetWidgetsToDefault = function () {
          scope.loadWidgets(scope.defaultWidgets);
          scope.saveDashboard();
        };

        // Set default widgets array
        var savedWidgetDefs = scope.dashboardState.load();

        // Success handler
        function handleStateLoad(saved) {
          scope.options.unsavedChangeCount = 0;
          if (saved && saved.length) {
            scope.loadWidgets(saved);
          } else if (scope.defaultWidgets) {
            scope.loadWidgets(scope.defaultWidgets);
          } else {
            scope.clear(true);
          }
        }

        if (angular.isArray(savedWidgetDefs)) {
          handleStateLoad(savedWidgetDefs);
        } else if (savedWidgetDefs && angular.isObject(savedWidgetDefs) && angular.isFunction(savedWidgetDefs.then)) {
          savedWidgetDefs.then(handleStateLoad, handleStateLoad);
        } else {
          handleStateLoad();
        }

        // expose functionality externally
        // functions are appended to the provided dashboard options
        scope.options.addWidget = scope.addWidget;
        scope.options.prependWidget = scope.prependWidget;
        scope.options.loadWidgets = scope.loadWidgets;
        scope.options.saveDashboard = scope.externalSaveDashboard;
        scope.options.removeWidget = scope.removeWidget;
        scope.options.openWidgetSettings = scope.openWidgetSettings;
        scope.options.clear = scope.clear;
        scope.options.resetWidgetsToDefault = scope.resetWidgetsToDefault

        // save state
        scope.$on('widgetChanged', function (event) {
          event.stopPropagation();
          scope.saveDashboard();
        });
      }
    };
  }]);

angular.module("ui.dashboard").run(["$templateCache", function($templateCache) {$templateCache.put("components/directives/dashboard/altDashboard.html","<div>\n    <div class=\"btn-toolbar\" ng-if=\"!options.hideToolbar\">\n        <div class=\"btn-group\" ng-if=\"!options.widgetButtons\">\n            <span class=\"dropdown\" on-toggle=\"toggled(open)\">\n              <button type=\"button\" class=\"btn btn-primary dropdown-toggle\" ng-disabled=\"disabled\">\n                Button dropdown <span class=\"caret\"></span>\n              </button>\n              <ul class=\"dropdown-menu\" role=\"menu\">\n                <li ng-repeat=\"widget in widgetDefs\">\n                  <a href=\"#\" ng-click=\"addWidgetInternal($event, widget);\" class=\"dropdown-toggle\">{{widget.name}}</a>\n                </li>\n              </ul>\n            </span>\n        </div>\n\n        <div class=\"btn-group\" ng-if=\"options.widgetButtons\">\n            <button ng-repeat=\"widget in widgetDefs\"\n                    ng-click=\"addWidgetInternal($event, widget);\" type=\"button\" class=\"btn btn-primary\">\n                {{widget.name}}\n            </button>\n        </div>\n\n        <button class=\"btn btn-warning\" ng-click=\"resetWidgetsToDefault()\">Default Widgets</button>\n\n        <button ng-if=\"options.storage && options.explicitSave\" ng-click=\"options.saveDashboard()\" class=\"btn btn-success\" ng-hide=\"!options.unsavedChangeCount\">{{ !options.unsavedChangeCount ? \"Alternative - No Changes\" : \"Save\" }}</button>\n\n        <button ng-click=\"clear();\" ng-hide=\"!widgets.length\" type=\"button\" class=\"btn btn-info\">Clear</button>\n    </div>\n\n    <div ui-sortable=\"sortableOptions\" ng-model=\"widgets\" class=\"dashboard-widget-area\">\n        <div ng-repeat=\"widget in widgets\" ng-style=\"widget.style\" class=\"widget-container\" widget>\n            <div class=\"widget panel panel-default\">\n                <div class=\"widget-header panel-heading\">\n                    <h3 class=\"panel-title\">\n                        <span class=\"widget-title\" ng-dblclick=\"editTitle(widget)\" ng-hide=\"widget.editingTitle\">{{widget.title}}</span>\n                        <form action=\"\" class=\"widget-title\" ng-show=\"widget.editingTitle\" ng-submit=\"saveTitleEdit(widget, $event)\">\n                            <input type=\"text\" ng-model=\"widget.title\" ng-blur=\"titleLostFocus(widget, $event)\" class=\"form-control\">\n                        </form>\n                        <span class=\"label label-primary\" ng-if=\"!options.hideWidgetName\">{{widget.name}}</span>\n                        <span ng-click=\"removeWidget(widget);\" class=\"glyphicon glyphicon-remove\" ng-if=\"!options.hideWidgetClose\"></span>\n                        <span ng-click=\"openWidgetSettings(widget);\" class=\"glyphicon glyphicon-cog\" ng-if=\"!options.hideWidgetSettings\"></span>\n                    </h3>\n                </div>\n                <div class=\"panel-body widget-content\"></div>\n                <div class=\"widget-w-resizer\">\n                    <div ng-if=\"widget.enableVerticalResize\" class=\"nw-resizer\" ng-mousedown=\"grabResizer($event, \'nw\')\"></div>\n                    <div class=\"w-resizer\" ng-mousedown=\"grabResizer($event, \'w\')\"></div>\n                    <div ng-if=\"widget.enableVerticalResize\" class=\"sw-resizer\" ng-mousedown=\"grabResizer($event, \'sw\')\"></div>\n                </div>\n                <div class=\"widget-e-resizer\">\n                    <div ng-if=\"widget.enableVerticalResize\" class=\"ne-resizer\" ng-mousedown=\"grabResizer($event, \'ne\')\"></div>\n                    <div class=\"e-resizer\" ng-mousedown=\"grabResizer($event, \'e\')\"></div>\n                    <div ng-if=\"widget.enableVerticalResize\" class=\"se-resizer\" ng-mousedown=\"grabResizer($event, \'se\')\"></div>\n                </div>\n                <div ng-if=\"widget.enableVerticalResize\" class=\"widget-n-resizer\">\n                    <div class=\"nw-resizer\" ng-mousedown=\"grabResizer($event, \'nw\')\"></div>\n                    <div class=\"n-resizer\" ng-mousedown=\"grabResizer($event, \'n\')\"></div>\n                    <div class=\"ne-resizer\" ng-mousedown=\"grabResizer($event, \'ne\')\"></div>\n                </div>\n                <div ng-if=\"widget.enableVerticalResize\" class=\"widget-s-resizer\">\n                    <div class=\"sw-resizer\" ng-mousedown=\"grabResizer($event, \'sw\')\"></div>\n                    <div class=\"s-resizer\" ng-mousedown=\"grabResizer($event, \'s\')\"></div>\n                    <div class=\"se-resizer\" ng-mousedown=\"grabResizer($event, \'se\')\"></div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n");
$templateCache.put("components/directives/dashboard/dashboard.html","<div>\n    <div class=\"btn-toolbar\" ng-if=\"!options.hideToolbar\">\n        <div class=\"btn-group\" ng-if=\"!options.widgetButtons\">\n            <span class=\"dropdown\" on-toggle=\"toggled(open)\">\n              <button type=\"button\" class=\"btn btn-primary dropdown-toggle\" data-toggle=\"dropdown\">\n                Button dropdown <span class=\"caret\"></span>\n              </button>\n              <ul class=\"dropdown-menu\" role=\"menu\">\n                <li ng-repeat=\"widget in widgetDefs\">\n                  <a href=\"#\" ng-click=\"addWidgetInternal($event, widget);\" class=\"dropdown-toggle\"><span class=\"label label-primary\">{{widget.name}}</span></a>\n                </li>\n              </ul>\n            </span>\n    </div>\n        <div class=\"btn-group\" ng-if=\"options.widgetButtons\">\n            <button ng-repeat=\"widget in widgetDefs\"\n                    ng-click=\"addWidgetInternal($event, widget);\" type=\"button\" class=\"btn btn-primary\">\n                {{widget.name}}\n            </button>\n        </div>\n\n        <button class=\"btn btn-warning\" ng-click=\"resetWidgetsToDefault()\">Default Widgets</button>\n\n        <button ng-if=\"options.storage && options.explicitSave\" ng-click=\"options.saveDashboard()\" class=\"btn btn-success\" ng-disabled=\"!options.unsavedChangeCount\">{{ !options.unsavedChangeCount ? \"all saved\" : \"save changes (\" + options.unsavedChangeCount + \")\" }}</button>\n\n        <button ng-click=\"clear();\" type=\"button\" class=\"btn btn-info\">Clear</button>\n    </div>\n\n    <div ui-sortable=\"sortableOptions\" ng-model=\"widgets\" class=\"dashboard-widget-area\">\n        <div ng-repeat=\"widget in widgets\" ng-style=\"widget.containerStyle\" class=\"widget-container\" widget>\n            <div class=\"widget panel panel-default\">\n                <div class=\"widget-header panel-heading\">\n                    <h3 class=\"panel-title\">\n                        <span class=\"widget-title\" ng-dblclick=\"editTitle(widget)\" ng-hide=\"widget.editingTitle\">{{widget.title}}</span>\n                        <form action=\"\" class=\"widget-title\" ng-show=\"widget.editingTitle\" ng-submit=\"saveTitleEdit(widget, $event)\">\n                            <input type=\"text\" ng-model=\"widget.title\" ng-blur=\"titleLostFocus(widget, $event)\" class=\"form-control\">\n                        </form>\n                        <span class=\"label label-primary\" ng-if=\"!options.hideWidgetName\">{{widget.name}}</span>\n                    </h3>\n                    <div class=\"buttons\">\n                        <span ng-click=\"removeWidget(widget);\" class=\"glyphicon glyphicon-remove\" ng-if=\"!options.hideWidgetClose\"></span>\n                        <span ng-click=\"openWidgetSettings(widget);\" class=\"glyphicon glyphicon-cog\" ng-if=\"!options.hideWidgetSettings\"></span>\n                        <span ng-click=\"widget.contentStyle.display = widget.contentStyle.display === \'none\' ? \'block\' : \'none\'\" class=\"glyphicon\" ng-class=\"{\'glyphicon-plus\': widget.contentStyle.display === \'none\', \'glyphicon-minus\': widget.contentStyle.display !== \'none\' }\"></span>\n                    </div>\n                </div>\n                <div class=\"panel-body widget-content\" ng-style=\"widget.contentStyle\"></div>\n                <div class=\"widget-w-resizer\">\n                    <div ng-if=\"widget.enableVerticalResize\" class=\"nw-resizer\" ng-mousedown=\"grabResizer($event, \'nw\')\"></div>\n                    <div class=\"w-resizer\" ng-mousedown=\"grabResizer($event, \'w\')\"></div>\n                    <div ng-if=\"widget.enableVerticalResize\" class=\"sw-resizer\" ng-mousedown=\"grabResizer($event, \'sw\')\"></div>\n                </div>\n                <div class=\"widget-e-resizer\">\n                    <div ng-if=\"widget.enableVerticalResize\" class=\"ne-resizer\" ng-mousedown=\"grabResizer($event, \'ne\')\"></div>\n                    <div class=\"e-resizer\" ng-mousedown=\"grabResizer($event, \'e\')\"></div>\n                    <div ng-if=\"widget.enableVerticalResize\" class=\"se-resizer\" ng-mousedown=\"grabResizer($event, \'se\')\"></div>\n                </div>\n                <div ng-if=\"widget.enableVerticalResize\" class=\"widget-n-resizer\">\n                    <div class=\"nw-resizer\" ng-mousedown=\"grabResizer($event, \'nw\')\"></div>\n                    <div class=\"n-resizer\" ng-mousedown=\"grabResizer($event, \'n\')\"></div>\n                    <div class=\"ne-resizer\" ng-mousedown=\"grabResizer($event, \'ne\')\"></div>\n                </div>\n                <div ng-if=\"widget.enableVerticalResize\" class=\"widget-s-resizer\">\n                    <div class=\"sw-resizer\" ng-mousedown=\"grabResizer($event, \'sw\')\"></div>\n                    <div class=\"s-resizer\" ng-mousedown=\"grabResizer($event, \'s\')\"></div>\n                    <div class=\"se-resizer\" ng-mousedown=\"grabResizer($event, \'se\')\"></div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>");
$templateCache.put("components/directives/dashboard/widget-settings-template.html","<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\" ng-click=\"cancel()\">&times;</button>\n  <h3>Widget Options <small>{{widget.title}}</small></h3>\n</div>\n\n<div class=\"modal-body\">\n    <form name=\"form\" novalidate class=\"form-horizontal\">\n        <div class=\"form-group\">\n            <label for=\"widgetTitle\" class=\"col-sm-2 control-label\">Title</label>\n            <div class=\"col-sm-10\">\n                <input type=\"text\" class=\"form-control\" name=\"widgetTitle\" ng-model=\"result.title\">\n            </div>\n        </div>\n        <div ng-if=\"widget.settingsModalOptions.partialTemplateUrl\"\n             ng-include=\"widget.settingsModalOptions.partialTemplateUrl\"></div>\n    </form>\n</div>\n\n<div class=\"modal-footer\">\n    <button type=\"button\" class=\"btn btn-default\" ng-click=\"cancel()\">Cancel</button>\n    <button type=\"button\" class=\"btn btn-primary\" ng-click=\"ok()\">OK</button>\n</div>");
$templateCache.put("components/directives/dashboardLayouts/SaveChangesModal.html","<div class=\"modal-header\">\n    <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\" ng-click=\"cancel()\">&times;</button>\n  <h3>Unsaved Changes to \"{{layout.title}}\"</h3>\n</div>\n\n<div class=\"modal-body\">\n    <p>You have {{layout.dashboard.unsavedChangeCount}} unsaved changes on this dashboard. Would you like to save them?</p>\n</div>\n\n<div class=\"modal-footer\">\n    <button type=\"button\" class=\"btn btn-default\" ng-click=\"cancel()\">Don\'t Save</button>\n    <button type=\"button\" class=\"btn btn-primary\" ng-click=\"ok()\">Save</button>\n</div>");
$templateCache.put("components/directives/dashboardLayouts/dashboardLayouts.html","<ul ui-sortable=\"sortableOptions\" ng-model=\"layouts\" class=\"nav nav-tabs layout-tabs\">\n    <li ng-repeat=\"layout in layouts\" ng-class=\"{ active: layout.active }\">\n        <a ng-click=\"makeLayoutActive(layout)\">\n            <span ng-dblclick=\"editTitle(layout)\" ng-show=\"!layout.editingTitle\">{{layout.title}}</span>\n            <form action=\"\" class=\"layout-title\" ng-show=\"layout.editingTitle\" ng-submit=\"saveTitleEdit(layout, $event)\">\n                <input type=\"text\" ng-model=\"layout.title\" ng-blur=\"titleLostFocus(layout, $event)\" class=\"form-control\" data-layout=\"{{layout.id}}\">\n            </form>\n            <span ng-if=\"!layout.locked\" ng-click=\"removeLayout(layout)\" class=\"glyphicon glyphicon-remove remove-layout-icon\"></span>\n            <!-- <span class=\"glyphicon glyphicon-pencil\"></span> -->\n            <!-- <span class=\"glyphicon glyphicon-remove\"></span> -->\n        </a>\n    </li>\n    <li>\n        <a ng-click=\"createNewLayout()\">\n            <span class=\"glyphicon glyphicon-plus\"></span>\n        </a>\n    </li>\n</ul>\n<div ng-repeat=\"layout in layouts | filter:isActive\" dashboard=\"layout.dashboard\" template-url=\"components/directives/dashboard/dashboard.html\"></div>");}]);
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

angular.module('ui.dashboard')
  .directive('widget', ['$injector', function ($injector) {

    return {

      controller: 'DashboardWidgetCtrl',

      link: function (scope) {

        var widget = scope.widget;
        var dataModelType = widget.dataModelType;

        // set up data source
        if (dataModelType) {
          var DataModelConstructor; // data model constructor function

          if (angular.isFunction(dataModelType)) {
            DataModelConstructor = dataModelType;
          } else if (angular.isString(dataModelType)) {
            $injector.invoke([dataModelType, function (DataModelType) {
              DataModelConstructor = DataModelType;
            }]);
          } else {
            throw new Error('widget dataModelType should be function or string');
          }

          var ds;
          if (widget.dataModelArgs) {
            ds = new DataModelConstructor(widget.dataModelArgs);
          } else {
            ds = new DataModelConstructor();
          }
          widget.dataModel = ds;
          ds.setup(widget, scope);
          ds.init();
          scope.$on('$destroy', _.bind(ds.destroy,ds));
        }

        // Compile the widget template, emit add event
        scope.compileTemplate();
        scope.$emit('widgetAdded', widget);

      }

    };
  }]);

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

angular.module('ui.dashboard')
  .controller('DashboardWidgetCtrl', ['$scope', '$element', '$compile', '$window', '$timeout',
    function($scope, $element, $compile, $window, $timeout) {

      $scope.status = {
        isopen: false
      };
      var resizeTimeoutId;

      // Fills "container" with compiled view
      $scope.makeTemplateString = function() {

        var widget = $scope.widget;

        // First, build template string
        var templateString = '';
        if (widget.templateUrl) {

          // Use ng-include for templateUrl
          templateString = '<div ng-include="\'' + widget.templateUrl + '\'"></div>';

        } else if (widget.template) {

          // Direct string template
          templateString = widget.template;

        } else {

          // Assume attribute directive
          templateString = '<div ' + widget.directive;

          // Check if data attribute was specified
          if (widget.dataAttrName) {
            widget.attrs = widget.attrs || {};
            widget.attrs[widget.dataAttrName] = 'widgetData';
          }

          // Check for specified attributes
          if (widget.attrs) {

            // First check directive name attr
            if (widget.attrs[widget.directive]) {
              templateString += '="' + widget.attrs[widget.directive] + '"';
            }

            // Add attributes
            _.each(widget.attrs, function(value, attr) {

              // make sure we aren't reusing directive attr
              if (attr !== widget.directive) {
                templateString += ' ' + attr + '="' + value + '"';
              }

            });
          }
          templateString += '></div>';
        }
        return templateString;
      };

      $scope.grabResizer = function(e, region) {

        var widget = $scope.widget;
        var widgetElm = $element.find('.widget');

        // ignore middle- and right-click
        if (e.which !== 1) {
          return;
        }

        e.stopPropagation();
        e.originalEvent.preventDefault();

        // get the starting horizontal position
        var initX = e.clientX;
        var initY = e.clientY;

        // Get the current width of the widget and dashboard
        var currentWidthPixel = widgetElm.width() + 2;
        var currentHeightPixel = widgetElm.height() + 2;
        var widthUnits = (widget.containerStyle.width || '0%').match(/\%|px/)[0];

        // pixel does not exactly equal browser width * percent (because of margin and padding)
        // calculate factor for later usegit st
        var parentWidth = $element.parent().width();

        var headerHeight = 0;
        var header = widgetElm.find('.widget-header.panel-heading');

        if (header && header.outerHeight) {
          headerHeight = (header.outerHeight() || 0);
        }

        var marginRight = parseInt(widgetElm.css('margin-right') || '0');

        // minWidth is used to prevent marquee from drawing less than min width allowed
        var minWidth;
        if (widget.size && widget.size.minWidth) {
          if (widget.size.minWidth.indexOf('%') > -1) {
            // min width is %, calculate based on window width
            minWidth = parseInt(widget.size.minWidth) * parentWidth / 100 - marginRight;
          } else {
            // min width is in pixels
            minWidth = parseInt(widget.size.minWidth) - marginRight;
          }
        } else {
          // just default min width to 40 if not set
          minWidth = 40;
        }

        // maxWidth is only set if width is in percentage.
        // If set to percentage, then max width should be 100% of the viewport
        var maxWidth = (widthUnits === '%' ? parentWidth - marginRight : Infinity);

        // minHeight is used to prevent marquee from drawing less than min height allowed
        var minHeight;
        if (widget.size && widget.size.minHeight) {
          // min width is in pixels
          minHeight = parseInt(widget.size.minHeight) + headerHeight + 4;
        } else {
          minHeight = 40 + headerHeight;
        }

        // maxHeight is only used to calculate maxWidth
        // it's applicable when resizing by N or S borders
        var maxHeight = Infinity;
        if (widget.size && widget.size.heightToWidthRatio !== undefined) {
          maxHeight = (maxWidth + marginRight) * widget.size.heightToWidthRatio + headerHeight + 4;
        }

        // create marquee element for resize action
        var $marquee = angular.element('<div class="widget-resizer-marquee ' + region + '" style="height: ' + currentHeightPixel + 'px; width: ' + currentWidthPixel + 'px;"></div>');
        $marquee.css('top', '-1px');
        $marquee.css('left', '-1px');
        widgetElm.append($marquee);

        var calculateHeight = function(width, includeMargins) {
          if ($scope.widget.size && $scope.widget.size.heightToWidthRatio !== undefined) {
            if (includeMargins) {
              return (width + marginRight) * $scope.widget.size.heightToWidthRatio + headerHeight + 4;
            } else {
              return width * $scope.widget.size.heightToWidthRatio;
            }
          }
        };

        var calculateWidth = function(height, includeMargins) {
          if ($scope.widget.size && $scope.widget.size.heightToWidthRatio !== undefined) {
            if (includeMargins) {
              return (height - headerHeight - 4) / $scope.widget.size.heightToWidthRatio - marginRight;
            } else {
              return height / $scope.widget.size.heightToWidthRatio;
            }
          }
        };

        // updates marquee with preview of new width
        var mousemove = function(e) {
          var newWidth, newHeight, top, left;
          switch(region) {
            case 'nw':
              newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + initX - e.clientX));
              newHeight = calculateHeight(newWidth, true) || Math.max(minHeight, currentHeightPixel + initY - e.clientY);
              left = currentWidthPixel - newWidth - 2;
              top = currentHeightPixel - newHeight - 2;
              break;
            case 'n':
              newHeight = Math.min(maxHeight, Math.max(minHeight, currentHeightPixel + initY - e.clientY));
              newWidth = calculateWidth(newHeight, true);
              top = currentHeightPixel - newHeight - 2;
              break;
            case 'ne':
              newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + e.clientX - initX));
              newHeight = calculateHeight(newWidth, true) || Math.max(minHeight, currentHeightPixel + initY - e.clientY);
              top = currentHeightPixel - newHeight - 2;
              break;
            case 'e':
              newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + e.clientX - initX));
              newHeight = calculateHeight(newWidth, true);
              break;
            case 'se':
              newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + e.clientX - initX));
              newHeight = calculateHeight(newWidth, true) || Math.max(minHeight, currentHeightPixel + e.clientY - initY);
              break;
            case 's':
              newHeight = Math.min(maxHeight, Math.max(minHeight, currentHeightPixel + e.clientY - initY));
              newWidth = calculateWidth(newHeight, true);
              break;
            case 'sw':
              newWidth = Math.max(minWidth, currentWidthPixel + initX - e.clientX);
              newHeight = calculateHeight(newWidth, true) || Math.max(minHeight, currentHeightPixel + e.clientY - initY);
              left = currentWidthPixel - newWidth - 2;
              break;
            case 'w':
              newWidth = Math.min(maxWidth, Math.max(minWidth, currentWidthPixel + initX - e.clientX));
              left = currentWidthPixel - newWidth - 2;
              newHeight = calculateHeight(newWidth, true);
              break;
          }
          if (top !== undefined) {
            $marquee.css('top', top + 'px');
          }
          if (left !== undefined) {
            $marquee.css('left', left);
          }
          if (newWidth !== undefined) {
            $marquee.css('width', newWidth + 'px');
          }
          if (newHeight !== undefined) {
            $marquee.css('height', newHeight + 'px');
          }
        };

        // sets new widget width on mouseup
        var mouseup = function(e) {
          // remove listener and marquee
          jQuery($window).off('mousemove', mousemove);

          var marqueeWidth = parseInt($marquee.width()) + 4;
          var marqueeHeight = parseInt($marquee.height()) + 4;

          $marquee.remove();

          var newWidth, newHeight, newWidthPixels;

          if (marqueeWidth !== currentWidthPixel && ['nw', 'w', 'sw', 'ne', 'e', 'se'].indexOf(region) > -1) {
            // possible width change
            newWidthPixels = marqueeWidth + marginRight;
            if (widthUnits === '%') {
              // convert new width to percent to call the setWidth function
              newWidth = (marqueeWidth + marginRight) / parentWidth * 100;
            } else {
              newWidth = newWidthPixels;
            }
          }
          if (marqueeHeight !== currentHeightPixel && ['nw', 'n', 'ne', 'sw', 's', 'se'].indexOf(region) > -1) {
            // possible height change
            newHeight = marqueeHeight - headerHeight - 2;
          }

          if (newWidthPixels !== undefined && ['w', 'e'].indexOf(region) > -1) {
            newHeight = calculateHeight(newWidthPixels);
          }

          if (newHeight !== undefined && ['n', 's'].indexOf(region) > -1) {
            newWidthPixels = calculateWidth(newHeight);
            if (newWidthPixels !== undefined) {
              if (widthUnits === '%') {
                // convert new width to percent to call the setWidth function
                newWidth = (marqueeWidth + marginRight) / parentWidth * 100;
              } else {
                newWidth = newWidthPixels;
              }
            }
          }

          // add to initial unit width
          var obj = {};
          if (newWidth !== undefined) {
            obj.width = widget.setWidth(newWidth, widthUnits);
            obj.widthPixels = newWidthPixels;
          }
          if (newHeight !== undefined) {
            obj.height = parseInt(widget.setHeight(newHeight));
          }
          $scope.$emit('widgetChanged', widget);
          $scope.$apply();
          $scope.$broadcast('widgetResized', obj);
        };
        jQuery($window).on('mousemove', mousemove).one('mouseup', mouseup);
      };

      // replaces widget title with input
      $scope.editTitle = function(widget) {
        var widgetElm = $element.find('.widget');
        widget.editingTitle = true;
        // HACK: get the input to focus after being displayed.
        $timeout(function() {
          widgetElm.find('form.widget-title input:eq(0)').focus()[0].setSelectionRange(0, 9999);
        });
      };

      // saves whatever is in the title input as the new title
      $scope.saveTitleEdit = function(widget, event) {
        widget.editingTitle = false;
        $scope.$emit('widgetChanged', widget);

        // When a browser is open and the user clicks on the widget title to change it,
        // upon pressing the Enter key, the page refreshes.
        // This statement prevents that.
        var evt = event || window.event;
        if (evt) {
          evt.preventDefault();
        }
      };

      $scope.titleLostFocus = function(widget, event) {
        // user clicked some where; now we lost focus to the input box
        // lets see if we need to save the title
        if (widget.editingTitle) {
          $scope.saveTitleEdit(widget, event);
        }
      };

      $scope.compileTemplate = function() {
        var container = $scope.findWidgetContainer($element);
        var templateString = $scope.makeTemplateString();
        var widgetElement = angular.element(templateString);

        if ($scope.widget.size && $scope.widget.size.contentOverflow) {
          $scope.widget.contentStyle.overflow = $scope.widget.size.contentOverflow;
        }
        container.empty();
        container.append(widgetElement);
        return $compile(widgetElement)($scope);
      };

      $scope.findWidgetContainer = function(element) {
        // widget placeholder is the first (and only) child of .widget-content
        return element.find('.widget-content');
      };

      function applyMinWidth () {
        var parentWidth, width, minWidth, widthUnit, minWidthUnit, newWidth, tmp;

        // see if minWidth is defined
        if ($scope.widget.size && $scope.widget.size.minWidth) {
          minWidth = parseFloat($scope.widget.size.minWidth);
          tmp = $scope.widget.size.minWidth.match(/px$|%$/i);
        } else if ($scope.widget.style && $scope.widget.style.minWidth) {
          minWidth = parseFloat($scope.widget.style.minWidth);
          tmp = $scope.widget.style.minWidth.match(/px$|%$/i);
        }
        if (!minWidth || isNaN(minWidth)) {
          // no need to enforce minWidth
          return false;
        }
        minWidthUnit = tmp ? tmp[0].toLowerCase() : 'px';  // <<< default to px if not defined

        // see if width is defined
        if ($scope.widget.size && $scope.widget.size.width) {
          width = parseFloat($scope.widget.size.width);
          tmp = $scope.widget.size.width.match(/px$|%$/i);
        } else if ($scope.widget.style && $scope.widget.style.width) {
          width = parseFloat($scope.widget.style.width);
          tmp = $scope.widget.style.width.match(/px$|%$/i);
        }
        widthUnit = tmp ? tmp[0].toLowerCase() : 'px';  // <<< default to px if not defined

        if (!width || isNaN(width)) {
          // no need to apply width either
          return false;
        }

        if (widthUnit === minWidthUnit) {
          // no need to apply minWidth if both units are the same
          return false;
        }

        parentWidth = $element.parent().width();

        // see if we need to convert width
        newWidth = (widthUnit === '%' ? parentWidth * width / 100 : width);

        // see if we need to convert minWidth
        minWidth = (minWidthUnit === '%' ? parentWidth * minWidth / 100 : minWidth);

        if (newWidth < minWidth) {
          // we should enforce the minWidth
          $element.width(minWidth);
          return true;
        }  else {
          $element.width(width + widthUnit);
          return false;
        }
      }

      function applyMinHeight() {
        if ($scope.widget.size && $scope.widget.size.minHeight) {
          var minHeight = parseInt($scope.widget.size.minHeight);
          if ($element.height() < minHeight) {
            $scope.widget.setHeight(minHeight);
          }
        }
      }

      function applyHeightRatio() {
        if ($scope.widget.size && $scope.widget.size.heightToWidthRatio !== undefined) {
          $scope.widget.setHeight($element.width() * $scope.widget.size.heightToWidthRatio);
        }
      }

      jQuery($window).on('resize', function() {
        // make sure width and height are greather than zero before apply dimension
        // dragging the tab from one browser to another causes the $element.width() to be 0
        if ($element.width() > 0 && $element.height() > 0) {
          $timeout.cancel(resizeTimeoutId);
          // default resize timeout to 100 milliseconds
          var time = ($scope.widget && $scope.widget.resizeTimeout !== undefined ? $scope.widget.resizeTimeout : 100);
          resizeTimeoutId = $timeout(function() {
            applyMinWidth();
            applyMinHeight();
            applyHeightRatio();
            $scope.$broadcast('widgetResized', {
              widthPixels: $element.width(),
              height: $element.height()
            });
          }, time);
        }
      });

      $scope.$on('widgetAdded', function() {
        $timeout(function() {
          applyMinWidth();
          applyHeightRatio();
        }, 0);
      });
    }
  ]);
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

angular.module('ui.dashboard')
  .directive('dashboardLayouts', ['LayoutStorage', '$timeout', '$uibModal',
    function(LayoutStorage, $timeout, $uibModal) {
      return {
        scope: true,
        templateUrl: function(element, attr) {
          return attr.templateUrl ? attr.templateUrl : 'components/directives/dashboardLayouts/dashboardLayouts.html';
        },
        link: function(scope, element, attrs) {

          scope.options = scope.$eval(attrs.dashboardLayouts);

          var layoutStorage = new LayoutStorage(scope.options);

          scope.layouts = layoutStorage.layouts;

          scope.createNewLayout = function() {
            var newLayout = {
              title: 'Custom',
              defaultWidgets: scope.options.defaultWidgets || []
            };
            layoutStorage.add(newLayout);
            scope.makeLayoutActive(newLayout);
            layoutStorage.save();
            return newLayout;
          };

          scope.removeLayout = function(layout) {
            layoutStorage.remove(layout);
            layoutStorage.save();
          };

          scope.makeLayoutActive = function(layout) {

            var current = layoutStorage.getActiveLayout();

            if (current && current.dashboard.unsavedChangeCount) {
              var modalInstance = $uibModal.open({
                templateUrl: 'template/SaveChangesModal.html',
                resolve: {
                  layout: function() {
                    return layout;
                  }
                },
                controller: 'SaveChangesModalCtrl'
              });

              // Set resolve and reject callbacks for the result promise
              modalInstance.result.then(
                function() {
                  current.dashboard.saveDashboard();
                  scope._makeLayoutActive(layout);
                },
                function() {
                  scope._makeLayoutActive(layout);
                }
              );
            } else {
              scope._makeLayoutActive(layout);
            }

          };

          scope._makeLayoutActive = function(layout) {
            angular.forEach(scope.layouts, function(l) {
              if (l !== layout) {
                l.active = false;
              } else {
                l.active = true;
              }
            });
            layoutStorage.save();
          };

          scope.isActive = function(layout) {
            return !!layout.active;
          };

          scope.editTitle = function(layout) {
            if (layout.locked) {
              return;
            }

            var input = element.find('input[data-layout="' + layout.id + '"]');
            layout.editingTitle = true;

            $timeout(function() {
              input.focus()[0].setSelectionRange(0, 9999);
            });
          };

          // saves whatever is in the title input as the new title
          scope.saveTitleEdit = function(layout, event) {
            layout.editingTitle = false;
            layoutStorage.save();

            // When a browser is open and the user clicks on the tab title to change it,
            // upon pressing the Enter key, the page refreshes.
            // This statement prevents that.
            var evt = event || window.event;
            if (evt) {
              evt.preventDefault();
            }
          };

          scope.titleLostFocus = function(layout, event) {
            // user clicked some where; now we lost focus to the input box
            // lets see if we need to save the title
            if (layout && layout.editingTitle) {
              if (layout.title !== '') {
                scope.saveTitleEdit(layout, event);
              } else {
                // can't save blank title
                var input = element.find('input[data-layout="' + layout.id + '"]');
                $timeout(function() {
                  input.focus();
                });
              }
            }
          };

          scope.options.saveLayouts = function() {
            layoutStorage.save(true);
          };
          scope.options.addWidget = function() {
            var layout = layoutStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.addWidget.apply(layout.dashboard, arguments);
            }
          };
          scope.options.prependWidget = function() {
            var layout = layoutStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.prependWidget.apply(layout.dashboard, arguments);
            }
          };
          scope.options.loadWidgets = function() {
            var layout = layoutStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.loadWidgets.apply(layout.dashboard, arguments);
            }
          };
          scope.options.saveDashboard = function() {
            var layout = layoutStorage.getActiveLayout();
            if (layout) {
              layout.dashboard.saveDashboard.apply(layout.dashboard, arguments);
            }
          };

          var sortableDefaults = {
            stop: function() {
              scope.options.saveLayouts();
            },
            distance: 5
          };
          scope.sortableOptions = angular.extend({}, sortableDefaults, scope.options.sortableOptions || {});
        }
      };
    }
  ]);
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

angular.module('ui.dashboard')
  .controller('SaveChangesModalCtrl', ['$scope', '$uibModalInstance', 'layout', function ($scope, $uibModalInstance, layout) {
    
    // add layout to scope
    $scope.layout = layout;

    $scope.ok = function () {
      $uibModalInstance.close();
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };
  }]);
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

angular.module('ui.dashboard')
  .controller('WidgetSettingsCtrl', ['$scope', '$uibModalInstance', 'widget', function ($scope, $uibModalInstance, widget) {
    // add widget to scope
    $scope.widget = widget;

    // set up result object
    $scope.result = jQuery.extend(true, {}, widget);

    $scope.ok = function () {
      $uibModalInstance.close($scope.result);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }]);
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

angular.module('ui.dashboard')
  .factory('WidgetModel', ["$log", function ($log) {

    function defaults() {
      return {
        title: 'Widget',
        style: {},
        size: { width: '33%' },
        enableVerticalResize: true,
        containerStyle: { width: '33%' }, // default width
        contentStyle: {}
      };
    };

    // constructor for widget model instances
    function WidgetModel(widgetDefinition, overrides) {
      // Extend this with the widget definition object with overrides merged in (deep extended).
      angular.extend(this, defaults(), _.merge(angular.copy(widgetDefinition), overrides));

      this.updateContainerStyle(this.style);

      if (!this.templateUrl && !this.template && !this.directive) {
        this.directive = widgetDefinition.name;
      }

      if (this.size && _.has(this.size, 'height')) {
        this.setHeight(this.size.height);
      }

      if (this.style && _.has(this.style, 'width')) { //TODO deprecate style attribute
        this.setWidth(this.style.width);
      }

      if (this.size && _.has(this.size, 'width')) {
        this.setWidth(this.size.width);
      }
    }

    WidgetModel.prototype = {
      // sets the width (and widthUnits)
      setWidth: function (width, units) {
        width = width.toString();
        units = units || width.replace(/^[-\.\d]+/, '') || '%';

        this.widthUnits = units;
        width = parseFloat(width);

        // check with min width if set, unit refer to width's unit
        if (this.size && _.has(this.size, 'minWidth') && _.endsWith(this.size.minWidth, units)) {
          width = _.max([parseFloat(this.size.minWidth), width]);
        }
        if (width < 0 || isNaN(width)) {
          $log.warn('malhar-angular-dashboard: setWidth was called when width was ' + width);
          return;
        }

        if (units === '%') {
          width = Math.min(100, width);
          width = Math.max(0, width);
        }

        this.containerStyle.width = width + '' + units;

        this.updateSize(this.containerStyle);

        return width + units;
      },

      setHeight: function (height) {
        this.contentStyle.height = height;
        this.updateSize(this.contentStyle);

        return height + 'px';
      },

      setStyle: function (style) {
        this.style = style;
        this.updateContainerStyle(style);
      },

      updateSize: function (size) {
        angular.extend(this.size, size);
      },

      updateContainerStyle: function (style) {
        angular.extend(this.containerStyle, style);
      },
      serialize: function() {
        return _.pick(this, ['title', 'name', 'style', 'size', 'dataModelOptions', 'attrs', 'storageHash']);
      }
    };

    return WidgetModel;
  }]);
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

angular.module('ui.dashboard')
  .factory('WidgetDefCollection', function () {

    function convertToDefinition(d) {
      if (typeof d === 'function') {
        return new d();
      }
      return d;
    }

    function WidgetDefCollection(widgetDefs) {
      
      widgetDefs = widgetDefs.map(convertToDefinition);

      this.push.apply(this, widgetDefs);

      // build (name -> widget definition) map for widget lookup by name
      var map = {};
      _.each(widgetDefs, function (widgetDef) {
        map[widgetDef.name] = widgetDef;
      });
      this.map = map;
    }

    WidgetDefCollection.prototype = Object.create(Array.prototype);

    WidgetDefCollection.prototype.getByName = function (name) {
      return this.map[name];
    };

    WidgetDefCollection.prototype.add = function(def) {
      def = convertToDefinition(def);
      this.push(def);
      this.map[def.name] = def;
    };

    return WidgetDefCollection;
  });

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

angular.module('ui.dashboard')
  .factory('WidgetDataModel', function () {
    function WidgetDataModel() {
    }

    WidgetDataModel.prototype = {
      setup: function (widget, scope) {
        this.dataAttrName = widget.dataAttrName;
        this.dataModelOptions = widget.dataModelOptions;
        this.widgetScope = scope;
      },

      updateScope: function (data) {
        this.widgetScope.widgetData = data;
      },

      init: function () {
        // to be overridden by subclasses
      },

      destroy: function () {
        // to be overridden by subclasses
      }
    };

    return WidgetDataModel;
  });
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

angular.module('ui.dashboard')
  .factory('LayoutStorage', function() {

    var noopStorage = {
      setItem: function() {

      },
      getItem: function() {

      },
      removeItem: function() {

      }
    };

    

    function LayoutStorage(options) {

      var defaults = {
        storage: noopStorage,
        storageHash: '',
        stringifyStorage: true
      };

      angular.extend(defaults, options);
      angular.extend(options, defaults);

      this.id = options.storageId;
      this.storage = options.storage;
      this.storageHash = options.storageHash;
      this.stringifyStorage = options.stringifyStorage;
      this.widgetDefinitions = options.widgetDefinitions;
      this.defaultLayouts = options.defaultLayouts;
      this.lockDefaultLayouts = options.lockDefaultLayouts;
      this.widgetButtons = options.widgetButtons;
      this.explicitSave = options.explicitSave;
      this.defaultWidgets = options.defaultWidgets;
      this.settingsModalOptions = options.settingsModalOptions;
      this.onSettingsClose = options.onSettingsClose;
      this.onSettingsDismiss = options.onSettingsDismiss;
      this.options = options;
      this.options.unsavedChangeCount = 0;

      this.layouts = [];
      this.states = {};
      this.load();
      this._ensureActiveLayout();
    }

    LayoutStorage.prototype = {

      add: function(layouts) {
        if (!angular.isArray(layouts)) {
          layouts = [layouts];
        }
        var self = this;
        angular.forEach(layouts, function(layout) {
          layout.dashboard = layout.dashboard || {};
          layout.dashboard.storage = self;
          layout.dashboard.storageId = layout.id = self._getLayoutId.call(self,layout);
          layout.dashboard.widgetDefinitions = layout.widgetDefinitions || self.widgetDefinitions;
          layout.dashboard.stringifyStorage = false;
          layout.dashboard.defaultWidgets = layout.defaultWidgets || self.defaultWidgets;
          layout.dashboard.widgetButtons = self.widgetButtons;
          layout.dashboard.explicitSave = self.explicitSave;
          layout.dashboard.settingsModalOptions = self.settingsModalOptions;
          layout.dashboard.onSettingsClose = self.onSettingsClose;
          layout.dashboard.onSettingsDismiss = self.onSettingsDismiss;
          self.layouts.push(layout);
        });
      },

      remove: function(layout) {
        var index = this.layouts.indexOf(layout);
        if (index >= 0) {
          this.layouts.splice(index, 1);
          delete this.states[layout.id];

          // check for active
          if (layout.active && this.layouts.length) {
            var nextActive = index > 0 ? index - 1 : 0;
            this.layouts[nextActive].active = true;
          }
        }
      },

      save: function() {

        var state = {
          layouts: this._serializeLayouts(),
          states: this.states,
          storageHash: this.storageHash
        };

        if (this.stringifyStorage) {
          state = JSON.stringify(state);
        }

        this.storage.setItem(this.id, state);
        this.options.unsavedChangeCount = 0;
      },

      load: function() {

        var serialized = this.storage.getItem(this.id);

        this.clear();

        if (serialized) {
          // check for promise
          if (angular.isObject(serialized) && angular.isFunction(serialized.then)) {
            this._handleAsyncLoad(serialized);
          } else {
            this._handleSyncLoad(serialized);
          }
        } else {
          this._addDefaultLayouts();
        }
      },

      clear: function() {
        this.layouts = [];
        this.states = {};
      },

      setItem: function(id, value) {
        this.states[id] = value;
        this.save();
      },

      getItem: function(id) {
        return this.states[id];
      },

      removeItem: function(id) {
        delete this.states[id];
        this.save();
      },

      getActiveLayout: function() {
        var len = this.layouts.length;
        for (var i = 0; i < len; i++) {
          var layout = this.layouts[i];
          if (layout.active) {
            return layout;
          }
        }
        return false;
      },

      _addDefaultLayouts: function() {
        var self = this;
        var defaults = this.lockDefaultLayouts ? { locked: true } : {};
        angular.forEach(this.defaultLayouts, function(layout) {
          self.add(angular.extend(_.clone(defaults), layout));
        });
      },

      _serializeLayouts: function() {
        var result = [];
        angular.forEach(this.layouts, function(l) {
          result.push({
            title: l.title,
            id: l.id,
            active: l.active,
            locked: l.locked,
            defaultWidgets: l.dashboard.defaultWidgets
          });
        });
        return result;
      },

      _handleSyncLoad: function(serialized) {
        
        var deserialized;

        if (this.stringifyStorage) {
          try {

            deserialized = JSON.parse(serialized);

          } catch (e) {
            this._addDefaultLayouts();
            return;
          }
        } else {

          deserialized = serialized;

        }

        if (this.storageHash !== deserialized.storageHash) {
          this._addDefaultLayouts();
          return;
        }
        this.states = deserialized.states;
        this.add(deserialized.layouts);
      },

      _handleAsyncLoad: function(promise) {
        var self = this;
        promise.then(
          angular.bind(self, this._handleSyncLoad),
          angular.bind(self, this._addDefaultLayouts)
        );
      },

      _ensureActiveLayout: function() {
        for (var i = 0; i < this.layouts.length; i++) {
          var layout = this.layouts[i];
          if (layout.active) {
            return;
          }
        }
        if (this.layouts[0]) {
          this.layouts[0].active = true;
        }
      },

      _getLayoutId: function(layout) {
        if (layout.id) {
          return layout.id;
        }
        var max = 0;
        for (var i = 0; i < this.layouts.length; i++) {
          var id = this.layouts[i].id;
          max = Math.max(max, id * 1);
        }
        return max + 1;
      }

    };
    return LayoutStorage;
  });
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

angular.module('ui.dashboard')
  .factory('DashboardState', ['$log', '$q', function ($log, $q) {
    function DashboardState(storage, id, hash, widgetDefinitions, stringify) {
      this.storage = storage;
      this.id = id;
      this.hash = hash;
      this.widgetDefinitions = widgetDefinitions;
      this.stringify = stringify;
    }

    DashboardState.prototype = {
      /**
       * Takes array of widget instance objects, serializes, 
       * and saves state.
       * 
       * @param  {Array} widgets  scope.widgets from dashboard directive
       * @return {Boolean}        true on success, false on failure
       */
      save: function (widgets) {
        
        if (!this.storage) {
          return true;
        }

        var serialized = _.map(widgets, function (widget) {
          return widget.serialize();
        });

        var item = { widgets: serialized, hash: this.hash };

        if (this.stringify) {
          item = JSON.stringify(item);
        }

        this.storage.setItem(this.id, item);
        return true;
      },

      /**
       * Loads dashboard state from the storage object.
       * Can handle a synchronous response or a promise.
       * 
       * @return {Array|Promise} Array of widget definitions or a promise
       */
      load: function () {

        if (!this.storage) {
          return null;
        }

        var serialized;

        // try loading storage item
        serialized = this.storage.getItem( this.id );

        if (serialized) {
          // check for promise
          if (angular.isObject(serialized) && angular.isFunction(serialized.then)) {
            return this._handleAsyncLoad(serialized);
          }
          // otherwise handle synchronous load
          return this._handleSyncLoad(serialized);
        } else {
          return null;
        }
      },

      _handleSyncLoad: function(serialized) {

        var deserialized, result = [];

        if (!serialized) {
          return null;
        }

        if (this.stringify) {
          try { // to deserialize the string

            deserialized = JSON.parse(serialized);

          } catch (e) {

            // bad JSON, log a warning and return
            $log.warn('Serialized dashboard state was malformed and could not be parsed: ', serialized);
            return null;

          }
        }
        else {
          deserialized = serialized;
        }

        // check hash against current hash
        if (deserialized.hash !== this.hash) {

          $log.info('Serialized dashboard from storage was stale (old hash: ' + deserialized.hash + ', new hash: ' + this.hash + ')');
          this.storage.removeItem(this.id);
          return null;

        }

        // Cache widgets
        var savedWidgetDefs = deserialized.widgets;

        // instantiate widgets from stored data
        for (var i = 0; i < savedWidgetDefs.length; i++) {

          // deserialized object
          var savedWidgetDef = savedWidgetDefs[i];

          // widget definition to use
          var widgetDefinition = this.widgetDefinitions.getByName(savedWidgetDef.name);

          // check for no widget
          if (!widgetDefinition) {
            // no widget definition found, remove and return false
            $log.warn('Widget with name "' + savedWidgetDef.name + '" was not found in given widget definition objects');
            continue;
          }

          // check widget-specific storageHash
          if (widgetDefinition.hasOwnProperty('storageHash') && widgetDefinition.storageHash !== savedWidgetDef.storageHash) {
            // widget definition was found, but storageHash was stale, removing storage
            $log.info('Widget Definition Object with name "' + savedWidgetDef.name + '" was found ' +
              'but the storageHash property on the widget definition is different from that on the ' +
              'serialized widget loaded from storage. hash from storage: "' + savedWidgetDef.storageHash + '"' +
              ', hash from WDO: "' + widgetDefinition.storageHash + '"');
            continue;
          }

          // push instantiated widget to result array
          result.push(savedWidgetDef);
        }

        return result;
      },

      _handleAsyncLoad: function(promise) {
        var self = this;
        var deferred = $q.defer();
        promise.then(
          // success
          function(res) {
            var result = self._handleSyncLoad(res);
            if (result) {
              deferred.resolve(result);
            } else {
              deferred.reject(result);
            }
          },
          // failure
          function(res) {
            deferred.reject(res);
          }
        );

        return deferred.promise;
      }

    };
    return DashboardState;
  }]);