'use strict';

describe('Controller: DashboardWidgetCtrl', function() {

  var $scope, $element, injections;

  beforeEach(module('ui.dashboard'));

  beforeEach(inject(function($rootScope, $controller, $timeout, $window){
    $scope = $rootScope.$new();
    var parent = angular.element('<div style="width: 400px; height: 200px;"><div>');
    $element = angular.element('<div><div class="widget"><form class="widget-title"><input type="text" value="Test Title"/></form></div></div>');
    parent.append($element);

    // let's mock the $timeout so we can spy on it
    // however, we still want to retain the original $timeout functionality
    // to test for time sensitive operations
    function timeout(fn, delay) {
      $timeout(fn, delay);
    };
    timeout.flush = function(ms) {
      $timeout.flush(ms);
    };
    timeout.cancel = function(id) {
      $timeout.cancel(id);
    }

    injections = {
      $scope: $scope,
      $element: $element,
      $timeout: timeout,
      $window: $window
    };
    spyOn(injections, '$timeout').and.callThrough();
    $controller('DashboardWidgetCtrl', injections);
  }));

  describe('the makeTemplateString method', function() {

    it('should return a string', function() {
      $scope.widget = {
        templateUrl: 'some/template.html'
      };
      expect(typeof $scope.makeTemplateString()).toEqual('string');
    });

    it('should use ng-include if templateUrl is specified on widget, despite any other options', function() {
      $scope.widget = {
        templateUrl: 'some/template.html',
        template: 'not this one',
        directive: 'or-this',
        attrs: {
          something: 'awesome',
          other: 'thing'
        }
      };
      expect($scope.makeTemplateString()).toMatch(/ng-include="'some\/template\.html'"/);
    });

    it('should return widget.template if specified, regardless of presence of directive or attrs', function() {
      $scope.widget = {
        template: '<div class="testing"></div>',
        directive: 'no-good'
      };
      expect($scope.makeTemplateString()).toEqual($scope.widget.template);
    });

    it('should use widget.directive as attribute directive', function() {
      $scope.widget = {
        directive: 'ng-awesome'
      };
      expect($scope.makeTemplateString()).toEqual('<div ng-awesome></div>');
    });

    it('should attach attributes if provided', function() {
      $scope.widget = {
        directive: 'ng-awesome',
        attrs: {
          'ng-awesome': 'test1',
          other: 'attr',
          more: 'stuff'
        }
      };
      expect($scope.makeTemplateString()).toEqual('<div ng-awesome="test1" other="attr" more="stuff"></div>');
    });

    it('should place widgetData into dataAttrName attribute if specified', function() {
      $scope.widget = {
        directive: 'ng-awesome',
        attrs: {
          'ng-awesome': 'test1',
          other: 'attr',
          more: 'stuff'
        },
        dataAttrName: 'data'
      };
      expect($scope.makeTemplateString()).toEqual('<div ng-awesome="test1" other="attr" more="stuff" data="widgetData"></div>');
    });

    it('should add attrs to the widget object if it does not exist and dataAttrName is specified', function() {
      $scope.widget = {
        directive: 'ng-awesome',
        dataAttrName: 'data'
      };
      expect($scope.makeTemplateString()).toEqual('<div ng-awesome data="widgetData"></div>');
    });

  });

  describe('the grabResizer method', function() {

    var evt, widget, WidgetModel;

    beforeEach(inject(function (_WidgetModel_) {
      WidgetModel = _WidgetModel_;
    }));

    beforeEach(function() {
      evt = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
        originalEvent: {
          preventDefault: jasmine.createSpy('preventDefault')
        },
        clientX: 100,
        which: 1
      };
      $scope.widget = widget = new WidgetModel({
        style: {
          width: '30%'
        }
      });
    });

    it('should do nothing if event.which is not 1 (left click)', function() {
      evt.which = 2;
      $scope.grabResizer(evt);
      expect(evt.stopPropagation).not.toHaveBeenCalled();
    });

    it('should call stopPropagation and preventDefault', function() {
      $scope.grabResizer(evt);
      expect(evt.stopPropagation).toHaveBeenCalled();
      expect(evt.originalEvent.preventDefault).toHaveBeenCalled();
    });

    it('should add a .widget-resizer-marquee element to the .widget element', function() {
      $scope.grabResizer(evt);
      expect($element.find('.widget-resizer-marquee').length).toBeGreaterThan(0);
    });

    it('should update marquee', function() {
      evt.which = 1;
      evt.clientX = 50;
      $scope.grabResizer(evt, 'e');

      // let's mock event
      var e = $.Event('mousemove');
      e.clientX = 300;

      jQuery(injections.$window).trigger(e);

      // started at 50, ends at 300, new width should be 250 + 4 (4 is for the left + right border widths)
      expect($element.find('div.widget-resizer-marquee').css('width')).toEqual('252px');
    });

    it('should hide marquee', function() {
      evt.width = 1;
      $scope.grabResizer(evt);

      // let's mock event
      var e = $.Event('mouseup');
      e.clientX = 300;

      jQuery(injections.$window).trigger(e);

      expect($element.find('div.widget-resizer-marquee').length).toEqual(0);
    });

    it('should support vertical mousemove', function() {
      evt.which = 1;
      evt.clientY = 50;
      $scope.grabResizer(evt, 's');

      // let's mock event
      var e = $.Event('mousemove');
      e.clientY = 300;

      jQuery(injections.$window).trigger(e);

      // started at 50, ends at 300, new height should be 250 + 4 (4 is for the top + bottom heights)
      expect($element.find('div.widget-resizer-marquee').css('height')).toEqual('252px');
    });

    it('should support vertical mouseup', function() {
      evt.width = 1;
      $scope.grabResizer(evt, 's');

      // let's mock event
      var e = $.Event('mouseup');
      e.clientY = 300;

      jQuery(injections.$window).trigger(e);

      expect($element.find('div.widget-resizer-marquee').length).toEqual(0);
    });

  });

  describe('the editTitle method', function() {
    
    it('should set editingTitle=true on the widget object', function() {
      var widget = {};
      $scope.editTitle(widget);
      expect(widget.editingTitle).toEqual(true);      
    });

    it('should call $timeout', function() {
      var widget = {};
      $scope.editTitle(widget);
      injections.$timeout.flush();
      expect(injections.$timeout).toHaveBeenCalled();
    });

  });

  describe('the saveTitleEdit method', function() {
    
    it('should set editingTitle=false', function() {
      var widget = { editingTitle: true };
      $scope.saveTitleEdit(widget);
      expect(widget.editingTitle).toEqual(false);
    });

    it('should call event preventDefault', function() {
      var widget = { editingTitle: true };
      var evt = {
        preventDefault: function() {}
      };
      spyOn(evt, 'preventDefault');
      $scope.saveTitleEdit(widget, evt);
      expect(evt.preventDefault).toHaveBeenCalled();
    });

  });

  describe('the applyMinWidth function', function() {

    it('should set 500px as width', function() {
      $scope.widget = {
        size: {
          width: '30%',
          minWidth: '500px'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(500);
    });

    it('should set 80% as width', function() {
      $scope.widget = {
        size: {
          width: '20px',
          minWidth: '80%'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(320);  // <<< 80% of 400px is 320px
    });


    it('should set 300px as width', function() {
      $scope.widget = {
        style: {
          width: '40%',
          minWidth: '300px'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(300);
    });

    it('should set 350px as width', function() {
      $scope.widget = {
        style: {
          width: '40%',
          minWidth: '350'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(350);
    });

    it('should set 90% as width', function() {
      $scope.widget = {
        style: {
          width: '50px',
          minWidth: '90%'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(360);  // <<< 90% of 400px is 360px
    });

    it('should set 600px as width', function() {
      $scope.widget = {
        style: {
          width: '600px',
          minWidth: '20%'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(600);
    });

    it('should not set width if missing', function() {
      $scope.widget = {
        style: {
          minWidth: '200px'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(0);
    });

    it('should not set width', function() {
      // applyMinWidth only applies the minWidth setting if the
      // width unit and minWidth unit are different
      $scope.widget = {
        style: {
          width: '50px',
          minWidth: '600px'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(0);
    });

    it('should not set width', function() {
      // applyMinWidth only applies the minWidth setting if the
      // width unit and minWidth unit are different
      $scope.widget = {
        style: {
          width: '50%',
          minWidth: '90%'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(0);
    });

    it('should not set width', function() {
      // applyMinWidth only applies the minWidth setting if the
      // width unit and minWidth unit are different
      $scope.widget = {
        size: {
          width: 'bad value',
          minWidth: '50%'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(0);
    });

    it('should not set width', function() {
      // applyMinWidth only applies the minWidth setting if the
      // width unit and minWidth unit are different
      $scope.widget = {
        size: {
          minWidth: 'bad value'
        }
      };

      $scope.$broadcast('widgetAdded');
      injections.$timeout.flush();
      expect($element.width()).toEqual(0);
    });

  });

  describe('the resize event', function() {
    beforeEach(function() {
      $scope.widget = {
        size: {
          width: '20px',
          minWidth: '90%'
        }
      };
    });

    it('should not run applyMinWidth', function() {
      // promise to run is cancelled because of we didn't wait long enough
      injections.$window.innerWidth = 1000;
      angular.element(injections.$window).triggerHandler('resize');
      $scope.$digest();
      injections.$timeout.flush(0);
      expect($element.width()).toEqual(0);
    });

    it('should not run applyMinWidth', function() {
      // promise to run is cancelled because of we didn't wait long enough
      $scope.widget.resizeTimeout = 2000;
      injections.$window.innerWidth = 1000;
      angular.element(injections.$window).triggerHandler('resize');
      $scope.$digest();
      injections.$timeout.flush(1000);
      expect($element.width()).toEqual(0);
    });

    it('should run applyMinWidth with default delay', function() {
      injections.$window.innerWidth = 1000;
      angular.element(injections.$window).triggerHandler('resize');
      $scope.$digest();
      injections.$timeout.flush(100);
      expect($element.width()).toEqual(360);
    });

    it('should run applyMinWidth with override delay', function() {
      $scope.widget.resizeTimeout = 50;
      injections.$window.innerWidth = 1000;
      angular.element(injections.$window).triggerHandler('resize');
      $scope.$digest();
      injections.$timeout.flush(50);
      expect($element.width()).toEqual(360);
    });

  });

  describe('the findWidgetContainer function', function() {

    it('should find the .widget-content', function() {
      // let's mock an element
      var markup = '<div>some parent text<div class="widget-content">my mock div</div></div>',
          element = angular.element(markup),
          el = $scope.findWidgetContainer(element);
      expect(el.length).toEqual(1);
      expect(el.text()).toEqual('my mock div');
    });

  });

  describe('the compileTemplate function', function() {

    it('should create a new widget', function() {
      $scope.widget = {
        templateUrl: 'some/template.html'
      };
      var el = $scope.compileTemplate();
      expect(el.length).toEqual(1);
    });

  });

});