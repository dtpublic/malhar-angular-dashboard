/*
* Copyright (c) 2013 DataTorrent, Inc. ALL Rights Reserved.
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

describe('Directive: wtTime', function () {

  var $compile, $rootScope, $interval, element, isoScope;

  // load the directive's module
  beforeEach(module('app'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$interval_) {
    // Cache these for reuse
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $interval = _$interval_;
  }));

  beforeEach(function() {
    // Set up the outer scope
    var scope = $rootScope.$new();
    var markup = '<div wt-time></div>';

    // Define and compile the element
    element = angular.element(markup);
    element = $compile(element)(scope);
    scope.$digest();
    isoScope = element.scope();

    spyOn($interval, 'cancel').and.callThrough();
  });

  it('should create div with time string', function() {
    expect(element.text()).toEqual('Time' + isoScope.time);
  });

  it('should update time as promised', function() {
    isoScope.time = 'some other text';
    $interval.flush(500);
    expect(isoScope.time).not.toEqual('some other text');
  });

  it('should call $interval.cancel', function() {
    isoScope.$destroy();
    expect($interval.cancel).toHaveBeenCalled();
  });

});

describe('Directive: wtScopeWatch', function () {

  var $compile, $rootScope, $interval, element, isoScope;

  // load the directive's module
  beforeEach(module('app'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {

    // Cache these for reuse
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function() {
    // Set up the outer scope
    var scope = $rootScope.$new();
    var markup = '<div wt-scope-watch value="someValue"></div>';

    scope.someValue = 'some randome text';

    // Define and compile the element
    element = angular.element(markup);
    element = $compile(element)(scope);
    scope.$digest();
    isoScope = element.scope();
  });

  it('should bind value to div', function() {
    expect(element.text()).toEqual('Valuesome randome text');
  });

});

describe('Directive: wtFluid', function () {

  var $compile, $rootScope, $templateCache, $interval, element, isoScope;

  beforeEach(module('app'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$templateCache_) {
    // Cache these for reuse
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $templateCache = _$templateCache_;
  }));

  beforeEach(function() {
    // let's add the fluid.html to the temlateCache
    $templateCache.put("app/template/fluid.html","<div class=\"demo-widget-fluid\">\n    <div>\n        <p>Widget takes 100% height (blue border).<p>\n        <p>Resize the widget vertically to see that this text (red border) stays middle aligned.</p>\n        <p>New width: {{width}}</p>\n        <p>New height: {{height}}</p>\n    </div>\n</div>");

    // Set up the outer scope
    var scope = $rootScope.$new();
    var markup = '<div wt-fluid></div>';

    scope.width = 10;
    scope.height = 20;

    // Define and compile the element
    element = angular.element(markup);
    element = $compile(element)(scope);
    scope.$digest();
    isoScope = element.scope();
  });

  it('should render html with divs', function() {
    expect(element.find('p.ng-binding').length).toEqual(2);
  });

  it('should update size', function() {
    var size = {
      width: 50,
      height: 60
    };
    isoScope.$emit('widgetResized', size);
    expect(isoScope.width).toEqual(50);
    expect(isoScope.height).toEqual(60);
  });

  it('should use scope size', function() {
    isoScope.$emit('widgetResized', {});
    expect(isoScope.width).toEqual(10);
    expect(isoScope.height).toEqual(20);
  });

});