'use strict';

describe('Directive: dashboard', function () {

  // mock UI Sortable
  beforeEach(function () {
    angular.module('ui.sortable', []);
  });

  // load the directive's module
  beforeEach(module('ui.dashboard'));

  var $rootScope, element;

  beforeEach(inject(function ($compile, _$rootScope_) {
    $rootScope = _$rootScope_;

    var widgetDefinitions = [
      {
        name: 'div',
        template: '<div class="value">{{value}}</div>'
      },
      {
        name: 'span',
        template: '<span></span>'
      }
    ];
    var defaultWidgets = _.clone(widgetDefinitions);
    $rootScope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: widgetDefinitions,
      defaultWidgets: defaultWidgets
    };
    $rootScope.value = 10;

    element = $compile('<div dashboard="dashboardOptions"></div>')($rootScope);
    $compile(element)($rootScope);
    $rootScope.$digest();
  }));

  it('should have toolbar', function () {
    var toolbar = element.find('.btn-toolbar');
    expect(toolbar.length).toEqual(1);
  });

  it('should have UI.Sortable directive', function () {
    var widgetArea = element.find('.dashboard-widget-area');
    expect(widgetArea.attr('ui-sortable')).toBeDefined();
  });

  it('should render widgets', function () {
    var widgets = element.find('.widget');
    expect(widgets.length).toEqual(2);
  });

  it('should evaluate widget expressions', function () {
    var divWidget = element.find('.value');
    expect(divWidget.html()).toEqual('10');
  });
});