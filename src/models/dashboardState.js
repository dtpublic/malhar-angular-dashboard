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
            dataSourceOptions: widget.dataSourceOptions
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
          result.push(new WidgetModel(widgetDefinition, widgetObject));
        }

        return result;
      }
    };
    return DashboardState;
  }]);