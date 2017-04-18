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
  .controller('DynamicDataCtrl', function ($scope, $window, widgetDefinitions, defaultWidgets, CartDataModel) {

    $scope.cart = new CartDataModel();
    $scope.item = {
      name: '',
      qty: 0,
      price: 0
    };

    var definitions = [{
      name: 'cartDetail',
      title: 'cart detail',
      templateUrl: 'app/template/cartDetail.html',
      size: { width: '800px', minWidth: '600px', },
      cart: $scope.cart
    }, {
      name: 'cartSummary',
      title: 'cart summary',
      templateUrl: 'app/template/cartSummary.html',
      size: { width: '400px', minWidth: '400px', },
      cart: $scope.cart
    }];

    var defaultWidgets = [
      { name: 'cartDetail' },
      { name: 'cartSummary' }
    ];

    $scope.dashboardOptions = {
      hideToolbar: true,
      widgetDefinitions: definitions,
      defaultWidgets: defaultWidgets,
      storage: $window.localStorage,
      storageId: 'demo_dynamic-data'
    };

    $scope.addItem = function() {
      if (!_.isEmpty($scope.item.name) &&
          $scope.item.qty !== undefined && $scope.item.qty > 0 &&
          $scope.item.price !== undefined && $scope.item.price > 0) {
        // only add item to cart if form is valid
        $scope.cart.addItem($scope.item);
        $scope.item = {
          name: '',
          qty: 0,
          price: 0
        };
      }
    };

    $scope.autoFillCart = function() {
      var list = [ 'Apple', 'Banana', 'Coke', 'Milk', 'Pear', 'Water' ];
      for(var i = 0; i < list.length; i++) {
        $scope.cart.addItem({
          name: list[i],
          qty: _.random(1, 10),
          price: _.round(_.random(1, 10, true), 2)
        });
      }
    };
  })
  .controller('CartCtrl', function ($scope) {
    $scope.removeItem = function(item) {
      $scope.cart.removeItem(item);
    };
  });