'use strict';

angular.module('ui.dashboard', ['ui.bootstrap', 'ui.sortable']);

angular.module('ui.dashboard')
  .factory('DashboardState', ['WidgetModel', function (WidgetModel) {
      function DashboardState(useLocalStorage, widgetDefinitions) {
        this.useLocalStorage = !!useLocalStorage;
        this.widgetDefinitions = widgetDefinitions;
      }
      DashboardState.prototype = {
        // Takes array of widgets, serializes, and saves state.
        // (currently stored in localStorage)
        save: function (lsKey, widgets) {
          console.log('saving dash state');
          if (!this.useLocalStorage) {
            return true;
          }
          if (arguments.length === 1) {
            widgets = lsKey;
            lsKey = 'default';
          }
          var serialized = _.map(widgets, function(widget) {
            var widgetObject = {};
            _.each(['title', 'name', 'style'], function(key) {
              widgetObject[key] = widget[key];
            });
            return widgetObject;
          });
          serialized = JSON.stringify(serialized);
          localStorage.setItem('widgets.' + lsKey, serialized);
          return true;
        },

        // Returns array of instantiated widget objects
        load: function (key) {

          if (!this.useLocalStorage) {
            return true;
          }

          var serialized, deserialized, result = [];
          key = key || 'default';
          
          // try loading localStorage item
          if (!(serialized = localStorage.getItem('widgets.' + key))) {
            return false;
          }

          try { // to deserialize the string
            deserialized = JSON.parse(serialized);
          } catch (e) {
            // bad JSON, clear localStorage
            localStorage.removeItem('widgets.' + key);
            return false;
          }
    
          // instantiate widgets from stored data
          for (var i = 0; i < deserialized.length; i++) {

            // deserialized object
            var widgetObject = deserialized[i];
            // widget definition to use
            var widgetDefinition = false;

            // find definition with same name
            for (var k = this.widgetDefinitions.length - 1; k >= 0; k--) {
              var def = this.widgetDefinitions[k];
              if (def.name === widgetObject.name) {
                widgetDefinition = def;
                break;
              }
            }

            // check for no widget
            if (!widgetDefinition) {
              // no widget definition found, remove and return false
              localStorage.removeItem('widgets.' + key);
              return false;
            }

            // push instantiated widget to result array
            result.push(new WidgetModel(widgetDefinition,widgetObject));
          }
  
          return result;
        }
      };
      return DashboardState;
    }])
  .factory('WidgetDataSource', function () {
    function WidgetDataSource() {
    }

    WidgetDataSource.prototype = {
      setup: function (widget, scope) {
        this.dataAttrName = widget.dataAttrName;
        this.dataSourceOptions = widget.dataSourceOptions;
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

    return WidgetDataSource;
  })
  .factory('WidgetModel', function () {

    // constructor for widget model instances
    function WidgetModel(Class, overrides) {
      overrides = overrides || {};
      angular.extend(this, {
        title: 'Widget',
        name: Class.name,
        attrs: Class.attrs,
        dataAttrName: Class.dataAttrName,
        dataTypes: Class.dataTypes,
        dataSourceType: Class.dataSourceType,
        dataSourceOptions: Class.dataSourceOptions,
        style: Class.style
      }, overrides);
      this.style = this.style || { width: '33%' };
      this.setWidth(this.style.width);

      if (Class.templateUrl) {
        this.templateUrl = Class.templateUrl;
      } else if (Class.template) {
        this.template = Class.template;
      } else {
        var directive = Class.directive || Class.name;
        this.directive = directive;
      }
    }

    WidgetModel.prototype = {

      // sets the width (and widthUnits)
      setWidth: function (width, units) {
        width = width.toString();
        units = units || width.replace(/^[-\.\d]+/, '') || '%';
        this.widthUnits = units;
        width = parseFloat(width);

        if (width < 0) {
          return false;
        }

        if (units === '%') {
          width = Math.min(100, width);
          width = Math.max(0, width);
        }
        this.style.width = width + '' + units;
        return true;
      }

    };

    return WidgetModel;
  })
  .controller('WidgetDialogCtrl', function ($scope, $modalInstance, widget, optionsTemplateUrl) {
    // add widget to scope
    $scope.widget = widget;

    // set up result object
    $scope.result = {
      title: widget.title
    };

    // look for optionsTemplateUrl on widget
    $scope.optionsTemplateUrl = optionsTemplateUrl || 'template/widget-default-content.html';

    $scope.ok = function () {
      $modalInstance.close($scope.result);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  })
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
        var count = 1;
        var dashboardState = scope.dashboardState = new DashboardState(
          // !!scope.options.useLocalStorage,
          true,
          scope.options.defaultWidgets
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

        scope.resetWidgetsToDefault = function () {
          scope.clear();
          _.each(scope.options.defaultWidgets, function (widgetDef) {
            scope.addWidget(widgetDef);
          });
        };

        // Set default widgets array
        if (!(scope.widgets = dashboardState.load())) {
          console.log('no dashboard state loaded');
          scope.resetWidgetsToDefault();
        } else {
          console.log('dashboard state loaded');
        }

        // allow adding widgets externally
        scope.options.addWidget = scope.addWidget;
        
      }
    };
  }
  ])
  .directive('widget', ['$compile', function ($compile) {
    function findWidgetPlaceholder(element) {
      // widget placeholder is the first (and only) child of .widget-content
      return angular.element(element.find('.widget-content').children()[0]);
    }

    return {

      link: function (scope, element) {
        // first child of .widget-content
        var elm = findWidgetPlaceholder(element);

        // the widget model/definition object
        var widget = scope.widget;

        // set up data source
        if (widget.dataSourceType) {
          //var ds = widget.ds;
          var ds = new widget.dataSourceType();
          widget.dataSource = ds;
          ds.setup(widget, scope);
          ds.init();
          scope.$on('$destroy', ds.destroy.bind(ds));
        }

        // .widget element (element is .widget-container)
        var widgetElm = element.find('.widget');

        // check for a template in widget def
        if (widget.templateUrl) {
          var includeTemplate = '<div ng-include="\'' + widget.templateUrl + '\'"></div>';
          var templateElm = angular.element(includeTemplate);
          elm.replaceWith(templateElm);
          elm = templateElm;
        } else if (widget.template) {
          elm.replaceWith(widget.template);
          elm = findWidgetPlaceholder(element);
        } else {
          elm.attr(widget.directive, '');

          if (widget.attrs) {
            _.each(widget.attrs, function (value, attr) {
              elm.attr(attr, value);
            });
          }

          if (widget.dataAttrName) {
            elm.attr(widget.dataAttrName, 'widgetData');
          }
        }

        scope.grabResizer = function (e) {

          // ignore middle- and right-click
          if (e.which !== 1) {
            return;
          }

          e.stopPropagation();
          e.originalEvent.preventDefault();

          // get the starting horizontal position
          var initX = e.clientX;
          // console.log('initX', initX);

          // Get the current width of the widget and dashboard
          var pixelWidth = widgetElm.width();
          var pixelHeight = widgetElm.height();
          var widgetStyleWidth = widget.style.width;
          var widthUnits = widget.widthUnits;
          var unitWidth = parseFloat(widgetStyleWidth);

          // create marquee element for resize action
          var $marquee = angular.element('<div class="widget-resizer-marquee" style="height: ' + pixelHeight + 'px; width: ' + pixelWidth + 'px;"></div>');
          widgetElm.append($marquee);

          // determine the unit/pixel ratio
          var transformMultiplier = unitWidth / pixelWidth;

          // updates marquee with preview of new width
          var mousemove = function (e) {
            var curX = e.clientX;
            var pixelChange = curX - initX;
            var newWidth = pixelWidth + pixelChange;
            $marquee.css('width', newWidth + 'px');
          };

          // sets new widget width on mouseup
          var mouseup = function (e) {
            // remove listener and marquee
            jQuery(window).off('mousemove', mousemove);
            $marquee.remove();

            // calculate change in units
            var curX = e.clientX;
            var pixelChange = curX - initX;
            var unitChange = Math.round(pixelChange * transformMultiplier * 100) / 100;

            // add to initial unit width
            var newWidth = unitWidth * 1 + unitChange;
            widget.setWidth(newWidth + widthUnits);
            scope.$apply();
          };

          jQuery(window).on('mousemove', mousemove).one('mouseup', mouseup);

        };

        // replaces widget title with input
        scope.editTitle = function (widget) {
          widget.editingTitle = true;
          // HACK: get the input to focus after being displayed.
          setTimeout(function () {
            widgetElm.find('form.widget-title input:eq(0)').focus()[0].setSelectionRange(0, 9999);
          }, 0);
        };

        // saves whatever is in the title input as the new title
        scope.saveTitleEdit = function (widget) {

          widget.editingTitle = false;
        };

        $compile(elm)(scope);
      }
    };
  }]);