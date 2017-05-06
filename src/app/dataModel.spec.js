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

describe('Factory: RandomDataModel', function () {

  var $interval, RandomDataModel, model;

  // load the service's module
  beforeEach(module('app'));

  // instantiate service
  beforeEach(inject(function (_$interval_, _RandomDataModel_) {
    $interval = _$interval_;
    RandomDataModel = _RandomDataModel_;
  }));

  beforeEach(function() {
    model = new RandomDataModel();
    model.setup({}, {});
    spyOn(model, 'updateScope').and.callThrough();
    spyOn(model, 'startInterval').and.callThrough();
    spyOn($interval, 'cancel').and.callThrough();
  });

  describe('the constructor', function() {

    it('should have model functions', function() {
      expect(typeof model.constructor).toEqual('function');
      expect(typeof model.destroy).toEqual('function');
      expect(typeof model.init).toEqual('function');
      expect(typeof model.startInterval).toEqual('function');
      expect(typeof model.updateLimit).toEqual('function');
    });

  });

  describe('the init function', function() {

    it('should use default as limit', function() {
      model.init();
      expect(model.limit).toEqual(100);
      expect(model.updateScope).toHaveBeenCalled();
      expect(model.startInterval).toHaveBeenCalled();
    });

    it('should set limit', function() {
      model.dataModelOptions = {
        limit: 30
      };
      model.init();
      expect(model.limit).toEqual(30);
    });

  });

  describe('the startInterval function', function() {

    it('should generate a random value', function() {
      model.startInterval();
      $interval.flush(500);
      expect(model.updateScope).toHaveBeenCalled();
    });

  });

  describe('the updateLimit function', function() {

    it('should set the limit', function() {
      model.init();
      model.updateLimit(50);
      expect(model.dataModelOptions).toEqual({ limit: 50 });
      expect(model.limit).toEqual(50);
    });

    it('should use existing dataModelOptions', function() {
      model.init();
      model.dataModelOptions = {
        extra: 'this is an extra property in the dataModelOptions'
      };
      model.updateLimit(80);
      expect(model.dataModelOptions.extra).toEqual('this is an extra property in the dataModelOptions');
      expect(model.dataModelOptions.limit).toEqual(80);
      expect(model.limit).toEqual(80);
    });

  });

  describe('the destroy function', function() {

    it('should call $interval.cancel', function() {
      model.destroy();
      expect($interval.cancel).toHaveBeenCalled();
    });

  });

});