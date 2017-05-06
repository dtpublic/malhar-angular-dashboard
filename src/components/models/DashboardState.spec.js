'use strict';

describe('Factory: DashboardState', function () {

  // load the service's module
  beforeEach(module('ui.dashboard'));

  // instantiate service
  var $q, $rootScope, DashboardState, WidgetDefCollection, storageData;

  beforeEach(inject(function (_$q_, _$rootScope_, _DashboardState_, _WidgetDefCollection_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    DashboardState = _DashboardState_;
    WidgetDefCollection = _WidgetDefCollection_;
  }));

  var model, storage, widgetDefitions, obj;

  beforeEach(function() {
    // let's mock the storage
    storage = {
      getItem: function(id) {
        return obj[id];
      },
      removeItem: function(id) {
        delete obj[id];
      },
      setItem: function(id, item) {
        storageData[id] = item;
      }
    };

    obj = {
      id1: JSON.stringify({
        widgets: [
          {
            title: 'Widget 1',
            name: 'random'
          }
        ],
      }),
      id2: {
        widgets: [
          {
            title: 'Widget 2',
            name: 'time'
          }
        ],
      },
      id3: JSON.stringify({
        widgets: [
          {
            title: 'Widget 3',
            name: 'time_xxxxx'
          }
        ],
      }),
      id4: 'BAD JSON STRING'
    };

    widgetDefitions = new WidgetDefCollection([
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
    ]);

    model = new DashboardState(storage, 'id1', undefined, widgetDefitions, true);
  });

  it('should be a function', function() {
    expect(typeof DashboardState).toEqual('function');
  });

  describe('the constructor', function() {

    it('should create a dashboard state object', function() {
      expect(typeof model).toEqual('object');
      expect(typeof model.storage).toEqual('object')
      expect(typeof model.widgetDefinitions).toEqual('object')
      expect(model.id).toEqual('id1');
      expect(model.hash).toBeUndefined();
      expect(model.stringify).toBe(true);
    });

  });

  describe('the load function', function() {

    it('should load widget', function() {
      var result = model.load();
      expect(result.length).toEqual(1);
      expect(result[0].title).toEqual('Widget 1');
      expect(result[0].name).toEqual('random');
    });

    it('should load a non-stringify widget', function() {
      model.stringify = false;
      model.id = 'id2';

      var result = model.load();
      expect(result.length).toEqual(1);
      expect(result[0].title).toEqual('Widget 2');
      expect(result[0].name).toEqual('time');
    });

    it('should abort when storage is undefined', function() {
      delete model.storage;
      var result = model.load();
      expect(result).toEqual(null);
    })

    it('should abort when serialized is undefined', function() {
      expect(model._handleSyncLoad()).toEqual(null);
    });

    it('should not load anything', function() {
      model.id = 'xxx';
      var result = model.load();
      expect(result).toEqual(null);
    });

    it('should return null', function() {
      model.id = 'id4';
      var result = model.load();
      expect(result).toEqual(null);
    });

    it('should return null because of outdated hash', function() {
      model.hash = 'xxxxxx';
      var result = model.load();
      expect(result).toEqual(null);
    });

    it('should load empty array', function() {
      // should not load anything if widget is not in the definition
      model.id = 'id3';
      var result = model.load();
      expect(result.length).toEqual(0);
    });

    it('should return null because of stale storage hash', function() {
      widgetDefitions[0].storageHash = 'xxxxx';
      var result = model.load();
      expect(result.length).toEqual(0);
    });

    describe('the async functions', function() {

      beforeEach(function() {
        // let's mock an async storage
        model.storage = {
          getItem: function(id) {
            var deferred = $q.defer();
            if (id === 'BAD_ID') {
              deferred.reject('bad id');
            } else {
              deferred.resolve(obj[id]);
            }
            return deferred.promise;
          }
        };
      });

      it('should resolve with one widget', function() {
        model.load().then(
          function(result) {
            expect(result[0].name).toEqual('random');
            expect(result[0].title).toEqual('Widget 1');
          },
          function(error) {
            throw 'Error: ' + error
          }
        );
        $rootScope.$digest();
      });

      it('should reject with null', function() {
        model.id = 'id4';
        model.load().then(
          function(result) {
            throw 'Expected error but received result: ' + result
          },
          function(error) {
            expect(error).toEqual(null);
          }
        );
        $rootScope.$digest();
      });

      it('should reject by storage.load', function() {
        model.id = 'BAD_ID';
        model.load().then(
          function(result) {
            throw 'Expected error but received result: ' + result
          },
          function(error) {
            expect(error).toEqual('bad id');
          }
        );
        $rootScope.$digest();
      });

    });

  });

  describe('the save function', function() {

    var widgets, func;

    beforeEach(function() {
      func = function() {
        return {
          name: this.name,
          title: this.title
        };
      };

      widgets = [
        {
          name: 'random',
          title: 'My new widget #1',
          serialize: func
        },
        {
          name: 'time',
          title: 'My new widget #2',
          serialize: func
        }
      ];

      storageData = {};
    });

    it('should add widgets to storageData', function() {
      expect(model.save(widgets)).toBe(true);
      expect(storageData.id1).toBeDefined();
    });

    it('should add non-stringify wdigets', function() {
      model.stringify = false;
      expect(model.save(widgets)).toBe(true);
      expect(storageData.id1).toBeDefined();
    });

    it('should abort', function() {
      delete model.storage
      expect(model.save(widgets)).toBe(true);
      expect(_.isEmpty(storageData)).toBe(true);
    });


  });

});