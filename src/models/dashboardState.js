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
        var serialized = _.map(widgets, function (widget) {
          var widgetObject = {
            title: widget.title,
            name: widget.name,
            style: widget.style,
            dataModelOptions: widget.dataModelOptions
          };

          return widgetObject;
        });

        serialized = JSON.stringify(serialized);
        localStorage.setItem('widgets.' + lsKey, serialized);
        return true;
      },

      // Returns array of instantiated widget objects
      load: function (key) {
        if (!this.useLocalStorage) {
          return null;
        }

        var serialized, deserialized, result = [];
        key = key || 'default';

        // try loading localStorage item
        if (!(serialized = localStorage.getItem('widgets.' + key))) {
          return null;
        }

        try { // to deserialize the string
          deserialized = JSON.parse(serialized);
        } catch (e) {
          // bad JSON, clear localStorage
          localStorage.removeItem('widgets.' + key);
          return null;
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
            return null;
          }

          // push instantiated widget to result array
          result.push(new WidgetModel(widgetDefinition, widgetObject));
        }

        return result;
      }
    };
    return DashboardState;
  }]);