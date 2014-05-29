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

angular.module('ui.dashboard')
  .factory('LayoutStorage', function() {

    function LayoutStorage(options) {

      angular.extend(options, { stringifyStorage: true }, options);

      this.id = options.storageId;
      this.storage = options.storage;
      this.storageHash = options.storageHash || '';
      this.stringify = options.stringifyStorage;
      this.widgetDefinitions = options.widgetDefinitions;
      this.defaultLayouts = options.defaultLayouts;
      this.widgetButtons = options.widgetButtons;
      this.explicitSave = options.explicitSave;
      this.options = options;
      this.options.unsavedChangeCount = 0;

      this.layouts = [];
      this.states = {};
      this.load();
    }

    LayoutStorage.prototype = {

      add: function(layouts) {
        if ( !(layouts instanceof Array) ) {
          layouts = [layouts];
        }

        var self = this;

        angular.forEach(layouts, function(layout) {
          layout.dashboard = layout.dashboard || {};
          layout.dashboard.storage = self;
          layout.dashboard.storageId = layout.id = self.layouts.length + 1;
          layout.dashboard.widgetDefinitions = self.widgetDefinitions;
          layout.dashboard.stringifyStorage = false;
          layout.dashboard.defaultWidgets = layout.defaultWidgets;
          layout.dashboard.widgetButtons = self.widgetButtons;
          layout.dashboard.explicitSave = self.explicitSave;
          self.layouts.push(layout);
        });
      },

      save: function(force) {

        var state = {
          layouts: this._serializeLayouts(),
          states: this.states,
          storageHash: this.storageHash
        };

        if (this.stringify) {
          state = JSON.stringify(state);
        }

        if (!this.explicitSave || force) {
          this.storage.setItem(this.id, state);
          this.options.unsavedChangeCount = 0;
        } else {
          this.options.unsavedChangeCount++;
        }
        
      },

      load: function() {

        var serialized = this.storage.getItem(this.id);

        if (serialized) {
          
          // check for promise
          if (typeof serialized === 'object' && typeof serialized.then === 'function') {
            this._handleAsyncLoad(serialized);
          }
           else {
            this._handleSyncLoad(serialized);
          }

        }

        else {
          this.add(this.defaultLayouts);
        }
      },

      setItem: function(id, value) {
        this.states[id] = value;
        this.save();
      },

      getItem: function(id) {
        return this.states[id];
      },

      removeItem: function(id) {
        delete this.states[id];
        this.save();
      },

      getActiveLayout: function() {
        var len = this.layouts.length;
        for (var i = 0; i < len; i++) {
          var layout = this.layouts[i];
          if (layout.active) {
            return layout;
          }
        }
        return false;
      },

      _serializeLayouts: function() {
        var result = [];
        angular.forEach(this.layouts, function(l) {
          result.push({
            title: l.title,
            id: l.id,
            active: l.active,
            defaultWidgets: l.dashboard.defaultWidgets
          });
        });
        return result;
      },

      _handleSyncLoad: function(serialized) {
        
        var deserialized;

        if (this.stringify) {
          try {

            deserialized = JSON.parse(serialized);

          } catch (e) {

            this.add(this.defaultLayouts);
            return;
          }
        } else {

          deserialized = serialized;

        }

        if (this.storageHash !== deserialized.storageHash) {
          this.add(this.defaultLayouts);
          return;
        }
        this.states = deserialized.states;
        this.add(deserialized.layouts);
      },

      _handleAsyncLoad: function(promise) {
        var self = this;
        promise.then(
          this._handleSyncLoad,
          function() {
            self.add(self.defaultLayouts);
          }
        );
      }

    };
    return LayoutStorage;
  });