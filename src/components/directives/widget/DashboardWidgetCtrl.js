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
        var initVal = (region === 's' ? e.clientY : e.clientX);

        // Get the current width of the widget and dashboard
        var pixelWidth = widgetElm.width();
        var pixelHeight = widgetElm.height();
        var widgetStyleWidth = widget.containerStyle.width;
        var widgetStyleHeight = widget.containerStyle.height;
        var widthUnits = widget.widthUnits;
        var pixelVal = (region === 's' ? pixelHeight : pixelWidth);
        var unitVal = parseFloat(region === 's' ? widgetStyleHeight : widgetStyleWidth);

        // create marquee element for resize action
        var $marquee = angular.element('<div class="widget-resizer-marquee" style="height: ' + pixelHeight + 'px; width: ' + pixelWidth + 'px;"></div>');
        widgetElm.append($marquee);

        // determine the unit/pixel ratio
        var transformMultiplier = unitVal / (region === 's' ? pixelHeight : pixelWidth);

        // updates marquee with preview of new width
        var mousemove = function(e) {
          var curVal = (region === 's' ? e.clientY : e.clientX);
          var pixelChange = curVal - initVal;
          var newVal = pixelVal + pixelChange;
          var style = (region === 's' ? 'height' : 'width');
          $marquee.css(style, newVal + 'px');
        };

        // sets new widget width on mouseup
        var mouseup = function(e) {
          // remove listener and marquee
          jQuery($window).off('mousemove', mousemove);
          $marquee.remove();

          // calculate change in units
          var curVal = (region === 's' ? e.clientY : e.clientX);
          var pixelChange = curVal - initVal;
          var unitChange = Math.round(pixelChange * transformMultiplier * 100) / 100;

          // add to initial unit width
          var obj = {};
          if (region === 's') {
            var widgetContainer = widgetElm.find('.widget-content'),
                height = parseInt(widgetContainer.css('height'), 10);
            obj.height = widget.setHeight(height + pixelChange);
          } else {
            obj.width = widget.setWidth(unitVal + unitChange, widthUnits);
          }
          $scope.$emit('widgetChanged', widget);
          $scope.$apply();
          $scope.$broadcast('widgetResized', obj);
          applyMinWidth();
        };
        jQuery($window).on('mousemove', mousemove).one('mouseup', mouseup);
      };

      $scope.grabSouthResizer = function(e) {
        // graphSouthResizer is kept for backward compatibility only
        // For new code,  html should have use the following examples:
        //   <div class="widget-ew-resizer" ng-mousedown="grabResizer($event, 'e')"></div>
        //   <div class="widget-s-resizer" ng-mousedown="grabResizer($event, 's')"></div>
        //
        // Old code example (which should still works):
        //   <div class="widget-ew-resizer" ng-mousedown="grabResizer($event)"></div>
        //   <div class="widget-s-resizer" ng-mousedown="grabSouthResizer($event)"></div>

        $scope.grabResizer(e, 's');
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

      jQuery($window).on('resize', function() {
        $timeout.cancel(resizeTimeoutId);
        // default resize timeout to 100 milliseconds
        var time = ($scope.widget && $scope.widget.resizeTimeout !== undefined ? $scope.widget.resizeTimeout : 100);
        resizeTimeoutId = $timeout(applyMinWidth, time);
      });

      $scope.$on('widgetAdded', function() {
        $timeout(function() {
          applyMinWidth();
        }, 0);
      });
    }
  ]);