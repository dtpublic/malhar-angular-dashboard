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
  .directive('wtWidget', function ($injector) {
    return {
      restrict: 'A',
      require: '^wtDashboard',
      transclude: true,
      replace: true,
      scope: {
        title: '@',
        modelType: '@'
      },
      templateUrl: 'wt-widget.html',
      link: function (scope, element, attrs, dashboardCtrl) {
        dashboardCtrl.addWidget(attrs.title);

        //TODO This is a hack. Workaround to find included widget content scope.
        //TODO In AngularJS transclude directive creates sibling scope, this should be fixed in AngularJS 1.3
        //TODO Issue https://github.com/angular/angular.js/issues/5489
        function getTranscludeScope() {
          var transcludeElem = jQuery(element).find('[ng-transclude]:first');
          var transcludeElemChild = angular.element(transcludeElem.children()[0]);
          return transcludeElemChild.scope();
        }

        var dataModelType = attrs.modelType;

        if (dataModelType) {
          var dataScope = getTranscludeScope();

          var widget = {
            dataAttrName: 'value'
          };

          $injector.invoke([dataModelType, function (DataModelType) {
            var ds = new DataModelType();
            widget.dataModel = ds;
            ds.setup(widget, dataScope);
            ds.init();
            dataScope.$on('$destroy', _.bind(ds.destroy, ds));
          }]);
        }
      }
    };
  });