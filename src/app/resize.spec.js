/*
* Copyright (c) 2015 DataTorrent, Inc. ALL Rights Reserved.
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

describe('Controller: ResizeDemoCtrl', function () {
  var scope, widgetDefinitions, interval;

  // load the directive's module
  beforeEach(module('app'));

  // Mock package
  beforeEach(inject(function ($compile, $rootScope, $controller, $interval) {
    // Set up the controller scope
    scope = $rootScope.$new();
    interval = $interval;

    widgetDefinitions = [{
      name: 'random',
      directive: 'wt-scope-watch',
      attrs: {
        value: 'randomValue'
      }
    }];

    $controller('ResizeDemoCtrl', {
      $scope: scope,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: ['random']
    });

    // Define and compile the element
    var element = angular.element('<div ng-controller="ResizeDemoCtrl"></div>');
    $compile(element)(scope);
    scope.$digest();
  }));

  it('should have dashboardOptions object defined', function() {
    expect(scope.dashboardOptions.widgetButtons).toEqual(true);
    expect(scope.dashboardOptions.widgetDefinitions).toEqual(widgetDefinitions);
    expect(scope.dashboardOptions.defaultWidgets.length).toEqual(9);
    expect(scope.dashboardOptions.storage).toBeDefined();
    expect(scope.dashboardOptions.storageId).toEqual('demo_resize');

    var randomValue = scope.randomValue;
    interval.flush(500);
    expect(scope.randomValue).not.toEqual(randomValue);
  });
});


describe('Controller: ResizableCtrl', function () {
  var scope;

  // load the directive's module
  beforeEach(module('app'));

  // Mock package
  beforeEach(inject(function ($compile, $rootScope, $controller) {
    // Set up the controller scope
    scope = $rootScope.$new();

    scope.width = 50;
    scope.height = 60;

    $controller('ResizableCtrl', {
      $scope: scope
    });

    // Define and compile the element
    var element = angular.element('<div ng-controller="ResizableCtrl"></div>');
    $compile(element)(scope);
    scope.$digest();
  }));

  it('should use defined with and height', function() {
    scope.$broadcast('widgetResized', { });
    expect(scope.width).toEqual(50);
    expect(scope.height).toEqual(60);
  });

  it('should set width and height to values in event', function() {
    scope.$broadcast('widgetResized', { width: 200, height: 300 });
    expect(scope.width).toEqual(200);
    expect(scope.height).toEqual(300);
  });
});