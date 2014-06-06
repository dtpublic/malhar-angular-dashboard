'use strict';

describe('Factory: LayoutStorage', function () {

  // mock UI Sortable
  beforeEach(function () {
    angular.module('ui.sortable', []);
  });

  // load the service's module
  beforeEach(module('ui.dashboard'));

  // instantiate service
  var LayoutStorage;
  beforeEach(inject(function (_LayoutStorage_) {
    LayoutStorage = _LayoutStorage_;
  }));

  describe('the constructor', function() {
    
    var storage, options;

    beforeEach(function() {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function(key, value) {

          },
          getItem: function(key) {

          },
          removeItem: function(key) {

          }
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [

        ],
        defaultLayouts: [],
        widgetButtons: false,
        explicitSave: false
      }
      spyOn(LayoutStorage.prototype, 'load' );
      storage = new LayoutStorage(options);
    });

    it('should provide an empty implementation of storage if it is not provided', function() {
      delete options.storage;
      var stateless = new LayoutStorage(options);
      var storage = stateless.storage;
      angular.forEach(['setItem', 'getItem', 'removeItem'], function(method) {
        expect(typeof storage[method]).toEqual('function');
      });
    });

    it('should set a subset of the options directly on the LayoutStorage instance itself', function() {
      var properties = {
        id: 'storageId',
        storage: 'storage',
        storageHash: 'storageHash',
        stringify: 'stringifyStorage',
        widgetDefinitions: 'widgetDefinitions',
        defaultLayouts: 'defaultLayouts',
        widgetButtons: 'widgetButtons',
        explicitSave: 'explicitSave'
      };

      angular.forEach(properties, function(val, key) {
        expect( storage[key] ).toEqual( options[val] );
      });

    });

    it('should create a layouts array and states object', function() {
      expect(storage.layouts instanceof Array).toEqual(true);
      expect(typeof storage.states).toEqual('object');
    });

    it('should call load', function() {
      expect(LayoutStorage.prototype.load).toHaveBeenCalled();
    });

  });

  describe('the add method', function() {
    
    var storage, options;

    beforeEach(function() {
      options = {
        storageId: 'testingStorage',
        storage: {
          setItem: function(key, value) {

          },
          getItem: function(key) {

          },
          removeItem: function(key) {

          }
        },
        storageHash: 'ds5f9d1f',
        stringifyStorage: true,
        widgetDefinitions: [

        ],
        defaultLayouts: [],
        widgetButtons: false,
        explicitSave: false
      }

      spyOn(LayoutStorage.prototype, 'load' );

      storage = new LayoutStorage(options);

    });

    // it('should ', function() {
      
    // });

  });

});