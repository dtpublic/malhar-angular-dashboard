'use strict';

angular.module('ui.dashboard')
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
  });