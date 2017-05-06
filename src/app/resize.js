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

angular.module('app')
  .controller('ResizeDemoCtrl', function ($scope, $interval, $window, widgetDefinitions, defaultWidgets) {
    defaultWidgets = [
      { name: 'fluid', resizeTimeout: 0  },
      { name: 'resizable', resizeTimeout: 0  },
      { name: 'random', style: { width: '50%' }, resizeTimeout: 0  },
      { name: 'time', style: { width: '50%' }, resizeTimeout: 0  },
      { name: 'resizable', title: 'resizable (width: 50%, minWidth: 40%)', size: { width: '50%', minWidth: '40%' }, resizeTimeout: 0 },
      { name: 'resizable', title: 'resizable (width: 50%, minWidth: 900px)', size: { width: '50%', minWidth: '900px' }, resizeTimeout: 0  },
      { name: 'resizable', title: 'resizable (width: 500px, minWidth: 70%)', size: { width: '500px', minWidth: '70%' }, resizeTimeout: 0  },
      { name: 'resizable', title: 'resizable (width: 500px, minWidth: 400px, minHeight: 100px)', size: { width: '200px', height: '50px', minWidth: '400px', minHeight: '100px' }, resizeTimeout: 0  }
    ];

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets,
      storage: $window.localStorage,
      storageId: 'demo_resize'
    };
    $scope.randomValue = Math.random();
    $interval(function () {
      $scope.randomValue = Math.random();
    }, 500);

    $scope.prependWidget = function() {
      $scope.dashboardOptions.prependWidget({ name: 'random', title: 'Prepend Widget'});
    };
  })
  .controller('ResizableCtrl', function ($scope) {
    $scope.$on('widgetResized', function (event, size) {
      $scope.width = size.width || $scope.width;
      $scope.height = size.height || $scope.height;
    });
  });