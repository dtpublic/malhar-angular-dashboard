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
  .directive('wtDashboard', function () {
    return {
      restrict: 'A',
      transclude: true,
      templateUrl: 'template/wt-dashboard.html',
      scope: true,
      controller: function ($scope) {
        $scope.widgets = [];

        this.addWidget = function (widget) {
          $scope.widgets.push(widget);
        };
      }
    };
  });