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
        if (widget.dataModelType) {
          //var ds = widget.ds;
          var ds = new widget.dataModelType();
          widget.dataModel = ds;
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
            scope.$emit('widgetChanged', widget);
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

        scope.$emit('widgetAdded', widget);
      }
    };
  }]);