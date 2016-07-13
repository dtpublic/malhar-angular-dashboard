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
  .factory('WidgetModel', function ($log) {

    function defaults() {
      return {
        title: 'Widget',
        style: {},
        size: {},
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
        if (_.has(this.style, 'minWidth')) {
          this.setWidth(this.style.width, undefined, this.style.minWidth, undefined);
        } else {
          this.setWidth(this.style.width, undefined);
        }
      }

      if (this.size && _.has(this.size, 'width')) {
        if (_.has(this.size, 'minWidth')) {
          this.setWidth(this.size.width, undefined, this.size.minWidth, undefined);
        } else {
          this.setWidth(this.size.width, undefined);
        }
      }
    }

    WidgetModel.prototype = {
      // sets the width (and widthUnits)
      setWidth: function (width, widthUnits, minWidth, minWidthUnits) {
        width = width.toString();
        widthUnits = widthUnits || width.replace(/^[-\.\d]+/, '') || '%';

        this.widthUnits = widthUnits;
        width = parseFloat(width);

        if (width < 0 || isNaN(width)) {
          $log.warn('malhar-angular-dashboard: setWidth was called when width was ' + width);
          return false;
        }

        if (widthUnits === '%') {
          width = Math.min(100, width);
          width = Math.max(0, width);
        }


        if (minWidth !== undefined) {
          minWidth = minWidth.toString();
          minWidthUnits = minWidthUnits || minWidth.replace(/^[-\.\d]+/, '') || '%';

          this.minWidthUnits = minWidthUnits;
          minWidth = parseFloat(minWidth);

          if (minWidth < 0 || isNaN(minWidth)) {
            $log.warn('malhar-angular-dashboard: setWidth was called when minWidth was ' + minWidth);
            return false;
          }

          if (minWidthUnits === '%') {
            minWidth = Math.min(100, minWidth);
            minWidth = Math.max(0, minWidth);
          }

          width = _.max([minWidth, width]); // if width < minWidth, set width = minWidth
        }

        this.containerStyle.width = width + '' + widthUnits;

        this.updateSize(this.containerStyle);

        return true;
      },

      setHeight: function (height) {
        this.contentStyle.height = height;
        this.updateSize(this.contentStyle);
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
  });