'use strict';

describe('Factory: WidgetModel', function () {

  // load the service's module
  beforeEach(module('ui.dashboard'));

  // instantiate service
  var WidgetModel;
  beforeEach(inject(function (_WidgetModel_) {
    WidgetModel = _WidgetModel_;
  }));

  it('should be a function', function() {
    expect(typeof WidgetModel).toEqual('function');
  });

  describe('the constructor', function() {
    var m, Class, Class2, overrides;

    beforeEach(function() {
      Class = {
        name: 'TestWidget', 
        attrs: {},
        dataAttrName: 'attr-name',
        dataModelType: function TestType() {},
        dataModelOptions: {},
        style: { width: '10em' },
        settingsModalOptions: {},
        onSettingsClose: function() {},
        onSettingsDismiss: function() {},
        funkyChicken: {
          cool: false,
          fun: true
        }
      };

      Class2 = {
        name: 'TestWidget2',
        attrs: {},
        dataAttrName: 'attr-name',
        dataModelType: function TestType() {},
        dataModelOptions: {},
        style: { width: '10em' },
        templateUrl: 'my/url.html',
        template: '<div>some template</div>'
      };

      overrides = {
        size: {
          height: '100px'
        },
        style: {
          width: '15em',
          minWidth: '10em'
        }
      };
      spyOn(WidgetModel.prototype, 'setWidth');
      spyOn(WidgetModel.prototype, 'setHeight');
      m = new WidgetModel(Class, overrides);
    });

    it('should copy class defaults, so that changes on an instance do not change the Class', function() {
      m.style.width = '20em';
      expect(Class.style.width).toEqual('10em');
    });

    it('should call setWidth', function() {
      expect(WidgetModel.prototype.setWidth).toHaveBeenCalled();
    });

    it('should call setHeight', function() {
      expect(WidgetModel.prototype.setHeight).toHaveBeenCalled();
    });

    it('should take overrides as precedent over Class defaults', function() {
      expect(m.style.width).toEqual('15em');
    });

    it('should copy arbitrary data from the widget definition', function() {
      expect(m.funkyChicken.cool).toEqual(false);
      expect(m.funkyChicken.fun).toEqual(true);
      expect(m.funkyChicken===Class.funkyChicken).toEqual(false);
    });

    it('should set templateUrl if and only if it is present on Class', function() {
      var m2 = new WidgetModel(Class2, overrides);
      expect(m2.templateUrl).toEqual('my/url.html');
    });

    it('should set template if and only if it is present on Class', function() {
      delete Class2.templateUrl;
      var m2 = new WidgetModel(Class2, overrides);
      expect(m2.template).toEqual('<div>some template</div>');
    });

    it('should look for directive if neither templateUrl nor template is found on Class', function() {
      delete Class2.templateUrl;
      delete Class2.template;
      Class2.directive = 'ng-bind';
      var m2 = new WidgetModel(Class2, overrides);
      expect(m2.directive).toEqual('ng-bind');
    });

    it('should set the name as directive if templateUrl, template, and directive are not defined', function() {
      delete Class2.templateUrl;
      delete Class2.template;
      var m2 = new WidgetModel(Class2, overrides);
      expect(m2.directive).toEqual('TestWidget2');
    });

    it('should not require overrides', function() {
      var fn = function() {
        var m2 = new WidgetModel(Class);
      }
      expect(fn).not.toThrow();
    });

    it('should copy references to settingsModalOptions, onSettingsClose, onSettingsDismiss', function() {
      var m = new WidgetModel(Class);
      expect(m.settingsModalOptions).toEqual(Class.settingsModalOptions);
      expect(m.onSettingsClose).toEqual(Class.onSettingsClose);
      expect(m.onSettingsDismiss).toEqual(Class.onSettingsDismiss);
    });

  });

  describe('setWidth method', function() {

    var context, setWidth;

    beforeEach(function() {
      var overrides = {
        size: {
          minWidth: '10%'
        }
      };
      context = new WidgetModel(overrides);
      setWidth = WidgetModel.prototype.setWidth;
    });
    
    it('should take one argument as a string with units', function() {
      setWidth.call(context, '100px');
      expect(context.containerStyle.width).toEqual('100px');
    });

    it('should take two args as a number and string as units', function() {
      setWidth.call(context, 100, 'px');
      expect(context.containerStyle.width).toEqual('100px');
    });

    it('should return undefined and not set anything if width is less than 0', function() {
      var result = setWidth.call(context, -100, 'em');
      expect(result).toBeUndefined();
      expect(context.containerStyle.width).not.toEqual('-100em');
    });

    it('should assume % if no unit is given', function() {
      setWidth.call(context, 50);
      expect(context.containerStyle.width).toEqual('50%');
    });

    it('should force greater than 0% and less than or equal 100%', function() {
      setWidth.call(context, '110%');
      expect(context.containerStyle.width).toEqual('100%');
    });

    it('should force min width to be used', function() {
      setWidth.call(context, 1, '%');
      expect(context.containerStyle.width).toEqual('10%');
    });
  });

  describe('setHeight method', function() {
    var context, setHeight;

    beforeEach(function() {
      context = new WidgetModel({});
      setHeight = WidgetModel.prototype.setHeight;
    });

    it('should set correct height', function() {
      setHeight.call(context, '200px');
      expect(context.contentStyle.height).toEqual('200px');
    });
  });

  describe('setStyle method', function() {
    var context, setStyle;

    beforeEach(function() {
      context = new WidgetModel({});
      setStyle = WidgetModel.prototype.setStyle;
    });

    it('should set correct style', function() {
      var style = {
        width: '70%',
        height: '300px'
      };
      setStyle.call(context, style);
      expect(context.containerStyle).toEqual(style);
    });
  });

  describe('serialize method', function() {
    var context, serialize;

    beforeEach(function() {
      var overrides = {
        name: 'widget1',
        title: 'test widget',
        style: {
          height: '200px'
        },
        size: {
          width: '50%'
        },
        dataModelOptions: {
          value1: '1'
        },
        attrs: {
          value2: '2'
        },
        storageHash: 'xy'
      };
      context = new WidgetModel(overrides);
      serialize = WidgetModel.prototype.serialize;
    });

    it('should return title, name, stle, sie, dataModelOptions, attrs and storageHash', function() {
      var result = serialize.call(context);
      expect(result.name).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.style).toBeDefined();
      expect(result.size).toBeDefined();
      expect(result.dataModelOptions).toBeDefined();
      expect(result.attrs).toBeDefined();
      expect(result.storageHash).toBeDefined();
    });
  });

});