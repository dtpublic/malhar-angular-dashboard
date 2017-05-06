'use strict';

describe('Factory: WidgetDataModel', function () {

  // load the service's module
  beforeEach(module('ui.dashboard'));

  // instantiate service
  var WidgetDataModel;
  beforeEach(inject(function (_WidgetDataModel_) {
    WidgetDataModel = _WidgetDataModel_;
  }));

  var model;

  beforeEach(function() {
    model = new WidgetDataModel();
  });

  it('should be a function', function() {
    expect(typeof WidgetDataModel).toEqual('function');
  });

  describe('the constructor', function() {

    it('should have functions', function() {
      expect(typeof model.setup).toEqual('function');
      expect(typeof model.updateScope).toEqual('function');
      expect(typeof model.init).toEqual('function');
      expect(typeof model.destroy).toEqual('function');
    });

  });

  describe('the setup function', function() {

    it('should set widget and scope', function() {
      // let's mock some data
      var widget = {
        dataAttrName: 'test attribute name',
        dataModelOptions: 'some options'
      };
      var scope = 'the scope';

      model.setup(widget, scope);

      expect(model.dataAttrName).toEqual('test attribute name');
      expect(model.dataModelOptions).toEqual('some options');
      expect(model.widgetScope).toEqual('the scope');
    });

  });

  describe('the updateScope function', function() {

    it('should update widgetData', function() {
      model.widgetScope = {};
      model.updateScope('new data');
      expect(model.widgetScope.widgetData).toEqual('new data');
    });

  });

  describe('the init function', function() {

    it('should execute without error', function() {
      var result = 'some text';

      expect(function() {
        result = model.init()
      }).not.toThrow();

      expect(result).toBeUndefined();
    });

  });

  describe('the destroy function', function() {

    it('should execute without error', function() {
      var result = 'some text';

      expect(function() {
        result = model.destroy()
      }).not.toThrow();

      expect(result).toBeUndefined();
    });

  });

});