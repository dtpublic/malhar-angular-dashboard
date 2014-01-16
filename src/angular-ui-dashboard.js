'use strict';

angular.module('ui.dashboard', ['ui.bootstrap', 'ui.sortable']);

angular.module('ui.dashboard')
  .factory('WidgetModel', function() {
    
    // constructor for widget model instances
    function WidgetModel(obj) {
      angular.extend(this, obj);
      this.style = this.style || { width: '33%' };
      this.setWidth(this.style.width);
    }

    WidgetModel.prototype = {

      // sets the width (and width_units)
      setWidth: function(width, units) {
        width = width.toString();
        units = units || width.replace(/^[-\.\d]+/, '') || '%';
        this.width_units = units;
        width = parseFloat(width);
        if (units === '%') {
          width = Math.min(100, width);
          width = Math.max(0, width);
        }
        this.style.width = width + '' + units;
      },

      width_units: '%'

    };

    return WidgetModel;

  })
  .directive('dashboard', ['WidgetModel', function (WidgetModel) {
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
            },
            handle: '.widget-header'
          };
        },
        link: function (scope, element, attrs) {
          scope.options = scope.$eval(attrs.dashboard);
  
          var count = 1;
  
          scope.addWidget = function (widgetDef) {
            var widget = new WidgetModel({
              title: 'Widget ' + count++,
              name: widgetDef.name,
              attrs: widgetDef.attrs,
              style: widgetDef.style
            });
  
            if (widgetDef.template) {
              widget.template = widgetDef.template;
            } else {
              var directive = widgetDef.directive ? widgetDef.directive : widgetDef.name;
              widget.directive = directive;
            }
  
            scope.widgets.push(widget);
          };
  
          scope.removeWidget = function (widget) {
            scope.widgets.splice(_.indexOf(scope.widgets, widget), 1);
          };
  
          scope.clear = function () {
            scope.widgets = [];
          };
  
          scope.widgets = [];
          _.each(scope.options.defaultWidgets, function (widgetDef) {
            scope.addWidget(widgetDef);
          });
  
          scope.addWidgetInternal = function (event, widgetDef) {
            event.preventDefault();
            scope.addWidget(widgetDef);
          };
  
          // allow adding widgets externally
          scope.options.addWidget = scope.addWidget;
        }
      };
    }])
  .directive('widget', ['$compile', function ($compile) {
    function findWidgetPlaceholder(element) {
      // widget placeholder is the first (and only) child of .widget-content
      return angular.element(element.find('.widget-content').children()[0]);
    }

    return {
      link: function (scope, element) {
        var elm = findWidgetPlaceholder(element);
        var widget = scope.widget;
        var widgetElm = element.find('.widget');

        if (widget.template) {
          elm.replaceWith(widget.template);
          elm = findWidgetPlaceholder(element);
        } else {
          elm.attr(widget.directive, '');

          if (widget.attrs) {
            _.each(widget.attrs, function (value, attr) {
              elm.attr(attr, value);
            });
          }
        }

        scope.grabResizer = function(e) {
          
          e.stopPropagation();
          e.originalEvent.preventDefault();

          // the resizer
          var $resizer = elm.find('.widget-ew-resizer');
          
          // get the starting horizontal position
          var initX = e.clientX;
          // console.log('initX', initX);
          
          // Get the current width of the widget and dashboard
          var pixel_width = widgetElm.width();
          var pixel_height = widgetElm.height();
          var widget_style_width = widget.style.width;
          var width_units = widget.width_units;
          var unit_width = parseFloat(widget_style_width);
          // console.log('widget_style_width', widget_style_width);
          // console.log('pixel_width', pixel_width);
          // console.log('unit_width', unit_width);
          
          // create marquee element for resize action
          var $marquee = angular.element('<div class="widget-resizer-marquee" style="height: ' + pixel_height + 'px; width: ' + pixel_width + 'px;"></div>');
          widgetElm.append($marquee);

          // determine the unit/pixel ratio
          var transformMultiplier = unit_width / pixel_width;
          // console.log('transformMultiplier', transformMultiplier);

          // Calculate change and apply new width on mousemove
          var mousemove = function(e) {
            var curX = e.clientX;
            var pixel_change = curX - initX;
            var new_width = pixel_width + pixel_change;
            $marquee.css('width', new_width + 'px');
          };
          
          var mouseup = function(e) {
            jQuery(window).off('mousemove', mousemove);
            $resizer.removeClass('widget-resizing');
            $marquee.remove();
            var curX = e.clientX;
            // console.log('curX', curX);
            var pixel_change = curX - initX;
            // console.log('pixel_change', pixel_change);
            var unit_change = Math.round( pixel_change * transformMultiplier * 10 ) / 10;
            // console.log('unit_change', pChange);
            var new_width = unit_width * 1 + unit_change;
            // console.log('new_width', new_width);
            widget.setWidth(new_width + width_units);
            scope.$apply();
          };
          
          $resizer.addClass('widget-resizing');
          
          jQuery(window)
            .on('mousemove', mousemove)
            .one('mouseup', mouseup);

        };

        $compile(elm)(scope);
      }
    };
  }]);