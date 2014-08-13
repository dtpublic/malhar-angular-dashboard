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
  .controller('DashboardWidgetCtrl', ['$scope', '$element', '$compile', '$window', '$timeout', function($scope, $element, $compile, $window, $timeout) {

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
          _.each(widget.attrs, function (value, attr) {

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

    $scope.grabResizer = function (e, direction, suppressEmit) {
      var widget = $scope.widget;
      var widgetElm = $element.find('.widget');

      // ignore middle- and right-click
      if (e.which !== 1) {
        return;
      }

      // Initialize direction-specific variables
      var styleAttr, unitsAttr, eventAttr, dimSetter, onDoubleClick, clickFlag;

      if (direction === 'ns') {
        styleAttr = 'height';
        unitsAttr = 'heightUnits';
        eventAttr = 'clientY';
        dimSetter = 'setHeight';
        clickFlag = 'userClickedNSResizer';
        onDoubleClick = function() {
          widget.setHeight();
          $scope.$emit('widgetChanged', widget);
        };
      }

      else {
        styleAttr = 'width';
        unitsAttr = 'widthUnits';
        eventAttr = 'clientX';
        dimSetter = 'setWidth';
        clickFlag = 'userClickedEWResizer';
        onDoubleClick = function() {
          widget.setWidth(100, '%');
        };
      }

      e.stopPropagation();
      e.originalEvent.preventDefault();

      // Check for double click (not using ng-dblclick because result is spotty)
      if ($scope[clickFlag]) {
        $scope[clickFlag] = false;
        return onDoubleClick();
      }

      $scope[clickFlag] = true;

      $timeout(function() {
        $scope[clickFlag] = false;
      }, 300);

      // get the starting horizontal position
      var initPosition = e[eventAttr];

      // Get the current dimension of the widget and dashboard
      var pxDimensions = {
        width: widgetElm.width(),
        height: widgetElm.height()
      };
      var widgetStyleAmount = widget.style[styleAttr];
      var unitType = widget[unitsAttr];
      var unitAmount = parseFloat(widgetStyleAmount);
      if (isNaN(unitAmount)) {
        unitAmount = pxDimensions[styleAttr];
        unitType = 'px';
      }

      // create marquee element for resize action
      var $marquee = widgetElm.find('.widget-resizer-marquee');
      if (!$marquee.length) {
        $marquee = angular.element('<div class="widget-resizer-marquee" style="height: ' + pxDimensions.height + 'px; width: ' + pxDimensions.width + 'px;"></div>');
        widgetElm.append($marquee);
      }

      // determine the unit/pixel ratio
      var transformMultiplier = unitAmount / pxDimensions[styleAttr];

      // updates marquee with preview of new width
      var mousemove = function (e) {
        var curPosition = e[eventAttr];
        var pixelChange = curPosition - initPosition;
        var newAmount = pxDimensions[styleAttr] + pixelChange;
        $marquee.css(styleAttr, newAmount + 'px');
      };

      // sets new widget width on mouseup
      var mouseup = function (e) {
        // debugger;
        // remove listener and marquee
        jQuery($window).off('mousemove', mousemove);
        $marquee.remove();

        // calculate change in units
        var curPosition = e[eventAttr];
        var pixelChange = curPosition - initPosition;
        var unitChange = Math.round(pixelChange * transformMultiplier * 100) / 100;

        // add to initial unit width
        var newAmount = unitAmount * 1 + unitChange;
        widget[dimSetter](newAmount + unitType);
        if (!suppressEmit) {
          $scope.$emit('widgetChanged', widget);
          $scope.$apply();
        }
      };
      jQuery($window).on('mousemove', mousemove).one('mouseup', mouseup);
    };

    $scope.grabBothResizers = function($event) {
      console.log('both');
      $scope.grabResizer($event, 'ew', true);
      $scope.grabResizer($event, 'ns');
    };

    // replaces widget title with input
    $scope.editTitle = function (widget) {
      var widgetElm = $element.find('.widget');
      widget.editingTitle = true;
      // HACK: get the input to focus after being displayed.
      $timeout(function () {
        widgetElm.find('form.widget-title input:eq(0)').focus()[0].setSelectionRange(0, 9999);
      });
    };

    // saves whatever is in the title input as the new title
    $scope.saveTitleEdit = function (widget) {
      widget.editingTitle = false;
      $scope.$emit('widgetChanged', widget);
    };

    $scope.compileTemplate = function() {
      var container = $scope.findWidgetContainer($element);
      var templateString = $scope.makeTemplateString();
      var widgetElement = angular.element(templateString);

      container.empty();
      container.append(widgetElement);
      $compile(widgetElement)($scope);
    };

    $scope.findWidgetContainer = function(element) {
      // widget placeholder is the first (and only) child of .widget-content
      return element.find('.widget-content');
    };
  }]);