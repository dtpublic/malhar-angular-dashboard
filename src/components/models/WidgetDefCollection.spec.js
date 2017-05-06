'use strict';

describe('Factory: WidgetDefCollection', function () {

  // load the service's module
  beforeEach(module('ui.dashboard'));

  // instantiate service
  var WidgetDefCollection;
  beforeEach(inject(function (_WidgetDefCollection_) {
    WidgetDefCollection = _WidgetDefCollection_;
  }));

  var widgetDefs = [
        {
          name: 'random',
          directive: 'wt-scope-watch',
          attrs: {
            value: 'randomValue'
          }
        },
        {
          name: 'time',
          directive: 'wt-time'
        }
      ];

  it('should be a function', function() {
    expect(typeof WidgetDefCollection).toEqual('function');
  });

  describe('the constructor', function() {

    it('should create widget definitions object', function() {
      var model = new WidgetDefCollection(widgetDefs);

      expect(_.isObject(model)).toBe(true);
      expect(model[0].name).toEqual('random');
      expect(model[0].directive).toEqual('wt-scope-watch');
      expect(model[0].attrs).toEqual({ value: 'randomValue' });
      expect(model[1].name).toEqual('time');
      expect(model[1].directive).toEqual('wt-time');
    });

  });

  describe('the constructor with definition function', function() {

    it('should create the definition using function', function() {
      var func = function() {
        return widgetDefs[0];
      };
      var model = new WidgetDefCollection([ func ]);

      expect(_.isObject(model)).toBe(true);
      expect(model[0].name).toEqual('random');
      expect(model[0].directive).toEqual('wt-scope-watch');
      expect(model[0].attrs).toEqual({ value: 'randomValue' });
    });

  });

  describe('the getByName function', function() {

    it('should return a widget definition', function() {
      var model = new WidgetDefCollection(widgetDefs);
      var result = model.getByName('random');

      expect(result.name).toEqual('random');
      expect(result.directive).toEqual('wt-scope-watch');
      expect(result.attrs).toEqual({ value: 'randomValue' });
    });

    it('should not find anything', function() {
      var model = new WidgetDefCollection(widgetDefs);
      var result = model.getByName('random');

      expect(result.name).toEqual('random');
      expect(result.directive).toEqual('wt-scope-watch');
      expect(result.attrs).toEqual({ value: 'randomValue' });
    })

  });

  describe('the add function', function() {

    it('should add a widget definition to the collection', function() {
      var model = new WidgetDefCollection(widgetDefs);
      model.add({
        name: 'new-wt'
      });

      expect(model[0].name).toEqual('random');
      expect(model[1].name).toEqual('time');
      expect(model[2].name).toEqual('new-wt');
    });

  });

});