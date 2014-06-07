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

describe('Directive: dashboard-layouts', function () {

  var $rootScope, element, childScope, DashboardState, LayoutStorage, $mockModal;

  // mock UI Sortable
  beforeEach(function () {
    angular.module('ui.sortable', []);
  });

  // load the directive's module
  beforeEach(module('ui.dashboard', function($provide) {
    $mockModal = {
      open: function() {}
    };
    $provide.value('$modal', $mockModal);
  }));

  beforeEach(inject(function ($compile, _$rootScope_, _DashboardState_, _LayoutStorage_) {
    // services
    $rootScope = _$rootScope_;
    DashboardState = _DashboardState_;
    LayoutStorage = _LayoutStorage_;

    // options
    var widgetDefinitions = [
      {
        name: 'wt-one',
        template: '<div class="wt-one-value">{{2 + 2}}</div>'
      },
      {
        name: 'wt-two',
        template: '<span class="wt-two-value">{{value}}</span>'
      }
    ];
    var defaultWidgets = _.clone(widgetDefinitions);
    $rootScope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultLayouts: [
        {
          title: 'first',
          active: true,
          defaultWidgets: defaultWidgets
        },
        {
          title: 'second',
          active: false,
          defaultWidgets: defaultWidgets
        }
      ],
      storage: {
        setItem: function(key, val) {

        },
        getItem: function(key) {

        },
        removeItem: function(key) {

        }
      }
    };
    $rootScope.value = 10;

    // element setup 
    element = $compile('<div dashboard-layouts="dashboardOptions"></div>')($rootScope);
    $rootScope.$digest();
    childScope = element.scope();
  }));

  it('should not require storage', inject(function($compile) {
    delete $rootScope.dashboardOptions.storage;
    expect(function() {
      var noStorageEl = $compile('<div dashboard-layouts="dashboardOptions"></div>')($rootScope);
      $rootScope.$digest();
    }).not.toThrow();
  }));

  it('should be able to use a different dashboard-layouts template', inject(function($compile, $templateCache) {
    $templateCache.put(
      'myCustomTemplate.html',
      '<ul class="my-custom-tabs layout-tabs">' +
      '<li ng-repeat="layout in layouts" ng-class="{ active: layout.active }">' +
      '<a ng-click="makeLayoutActive(layout)">' +
      '<span ng-dblclick="editTitle(layout)" ng-show="!layout.editingTitle">{{layout.title}}</span>' +
      '<form action="" class="layout-title" ng-show="layout.editingTitle" ng-submit="saveTitleEdit(layout)">' +
      '<input type="text" ng-model="layout.title" class="form-control" data-layout="{{layout.id}}">' +
      '</form>' +
      '<span ng-click="removeLayout(layout)" class="glyphicon glyphicon-remove"></span>' +
      '<!-- <span class="glyphicon glyphicon-pencil"></span> -->' +
      '<!-- <span class="glyphicon glyphicon-remove"></span> -->' +
      '</a>' +
      '</li>' +
      '<li>' +
      '<a ng-click="createNewLayout()">' +
      '<span class="glyphicon glyphicon-plus"></span>' +
      '</a>' +
      '</li>' +
      '</ul>' +
      '<div ng-repeat="layout in layouts | filter:isActive" dashboard="layout.dashboard" templateUrl="template/dashboard.html"></div>'
    );
    var customElement = $compile('<div dashboard-layouts="dashboardOptions" template-url="myCustomTemplate.html"></div>')($rootScope);
    $rootScope.$digest();
    expect(customElement.find('ul.my-custom-tabs').length).toEqual(1);
  }));

  describe('the createNewLayout method', function() {

    it('should call the add and save methods of LayoutStorage', function() {
      spyOn(LayoutStorage.prototype, 'add');
      spyOn(LayoutStorage.prototype, 'save');

      childScope.createNewLayout();
      expect(LayoutStorage.prototype.add).toHaveBeenCalled();
      expect(LayoutStorage.prototype.save).toHaveBeenCalled();
    });

    it('should return the newly created layout object', function() {
      var result = childScope.createNewLayout();
      expect(typeof result).toEqual('object');
    });

    it('should set active=true on the newly created layout', function() {
      var result = childScope.createNewLayout();
      expect(result.active).toEqual(true);
    });

  });

  describe('the removeLayout method', function() {
    
    it('should call the remove and save methods of LayoutStorage', function() {
      spyOn(LayoutStorage.prototype, 'remove');
      spyOn(LayoutStorage.prototype, 'save');

      childScope.removeLayout(childScope.layouts[0]);
      expect(LayoutStorage.prototype.remove).toHaveBeenCalled();
      expect(LayoutStorage.prototype.save).toHaveBeenCalled();
    });

    it('should call remove with the layout it was passed', function() {
      spyOn(LayoutStorage.prototype, 'remove');
      var layout = childScope.layouts[0];
      childScope.removeLayout(layout);
      expect(LayoutStorage.prototype.remove.calls.argsFor(0)[0]).toEqual(layout);
    });

  });

  describe('the makeLayoutActive method', function() {

    it('should call _makeLayoutActive if there is not a currently active dashboard with unsaved changes', function() {
      spyOn(childScope, '_makeLayoutActive');
      var layout = childScope.layouts[1];
      childScope.makeLayoutActive(layout);
      expect(childScope._makeLayoutActive).toHaveBeenCalled();
    });

    describe('when there are unsaved changes on the current dashboard', function() {
      
      var current, options, successCb, errorCb, layout;

      beforeEach(function() {
        current = childScope.layouts[0];
        current.dashboard.unsavedChangeCount = 1;

        spyOn($mockModal, 'open').and.callFake(function(arg) {
          options = arg;
          return {
            result: {
              then: function(success, error) {
                successCb = success;
                errorCb = error;
              }
            }
          }
        });

        layout = childScope.layouts[1];
        childScope.makeLayoutActive(layout);
      });

      it('should create a modal', function() {
        expect($mockModal.open).toHaveBeenCalled();
      });

      it('should resolve layout to the layout to be made active', function() {
        expect(options.resolve.layout()).toEqual(layout);
      });

      it('should provide a success callback that saves the current dashboard and then calls _makeLayoutActive', function() {
        spyOn(current.dashboard, 'saveDashboard');
        spyOn(childScope, '_makeLayoutActive');
        successCb();
        expect(current.dashboard.saveDashboard).toHaveBeenCalled();
        expect(childScope._makeLayoutActive).toHaveBeenCalled();
        expect(childScope._makeLayoutActive.calls.argsFor(0)[0]).toEqual(layout);
      });

      it('should provide an error callback that only calls _makeLayoutActive', function() {
        spyOn(current.dashboard, 'saveDashboard');
        spyOn(childScope, '_makeLayoutActive');
        errorCb();
        expect(current.dashboard.saveDashboard).not.toHaveBeenCalled();
        expect(childScope._makeLayoutActive).toHaveBeenCalled();
        expect(childScope._makeLayoutActive.calls.argsFor(0)[0]).toEqual(layout);
      });

    });

    

  });

});