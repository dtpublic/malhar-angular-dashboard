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
        var currentWidthPixel = widgetElm.width() + 4;
        var currentHeightPixel = widgetElm.height() + 4;
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
          var marqueeHeight = parseInt($marquee.height());

          $marquee.remove();

          var newWidth, newHeight, newWidthPixels;

          if (['nw', 'w', 'sw', 'ne', 'e', 'se'].indexOf(region) > -1) {
            // possible width change
            newWidthPixels = marqueeWidth + marginRight;
            if (widthUnits === '%') {
              // convert new width to percent to call the setWidth function
              newWidth = (marqueeWidth + marginRight) / parentWidth * 100;
            } else {
              newWidth = newWidthPixels;
            }
          }
          if (['nw', 'n', 'ne', 'sw', 's', 'se'].indexOf(region) > -1) {
            // possible height change
            newHeight = marqueeHeight - headerHeight;
          }

          if (['w', 'e'].indexOf(region) > -1) {
            newHeight = calculateHeight(newWidthPixels);
          }

          if (['n', 's'].indexOf(region) > -1) {
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
      });

      $scope.$on('widgetAdded', function() {
        $timeout(function() {
          applyMinWidth();
          applyMinHeight();
          applyHeightRatio();
        }, 0);
      });
    }
  ]);