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

angular.module('app')
  .factory('CartDataModel', function() {
    function CartDataModel() {
      this.items = [];          // array to store all items in cart
      this.total = 0;           // total price of all items in cart
      this.qty = 0;             // total count of all items in cart
      this.expItem = {};        // most expensive item in cart based on unit price
      this.cheapItem = {};      // cheapest item in cart based on unit price
    }

    angular.extend(CartDataModel.prototype, {
      addItem: function(item) {
        var index = _.findIndex(this.items, function(i) {
          return i.name === item.name;
        });
        if (index > -1) {
          // item already in cart, increase qty and adjust unit price
          this.items[index].qty += item.qty;
          this.items[index].total += item.qty * item.price;

          // need to adjust unit price
          this.items[index].price = Math.round(this.items[index].total / this.items[index].qty * 100) / 100;
        }
        else {
          // add new item
          item.total = Math.round(item.qty * item.price * 100) / 100;
          this.items.push(item);
        }
        this.processItems();
      },
      removeItem: function(item) {
        var index = _.findIndex(this.items, function(i) {
          return i.name === item.name;
        });
        if (index > -1) {
          this.items.splice(index, 1);
          this.processItems();
        }
      },
      processItems: function() {
        // recalculate qty and total and determine most expensive and cheapest items
        var this_ = this;
        this_.total = 0;
        this_.qty = 0;
        this_.expItem = {
          price: -Infinity
        };
        this_.cheapItem = {
          price: Infinity
        };
        _.each(this.items, function(item) {
          this_.total += item.total;
          this_.qty += item.qty;
          if (item.price > this_.expItem.price) {
            this_.expItem = item;
          }
          if (item.price < this_.cheapItem.price) {
            this_.cheapItem = item;
          }
        });

        // handle Javascript rounding issue
        this_.total = Math.round(this_.total * 100) / 100;

      }
    });

    return CartDataModel;
  });