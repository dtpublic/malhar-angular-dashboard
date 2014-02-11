'use strict';

angular.module('ui.dashboard')
  .factory('WidgetDefCollection', function () {
    function WidgetDefCollection(widgetDefs) {
      this.push.apply(this, widgetDefs);
    }

    WidgetDefCollection.prototype = Object.create(Array.prototype);

    WidgetDefCollection.prototype.getByName = function (name) {
      return _.findWhere(this, { name: name });
    };

    return WidgetDefCollection;
  });