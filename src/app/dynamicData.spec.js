'use strict';

describe('Controller: DynamicDataCtrl', function() {

  var $scope, $element;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, $window){
    $scope = $rootScope.$new();

    $controller('DynamicDataCtrl', {
      $scope: $scope,
      $window: $window
    });
  }));

  describe('the controller properties', function() {

    it('should have properties in scope', function() {
      expect($scope.cart.items.length).toEqual(0);
      expect($scope.item.name).toEqual('');
      expect($scope.item.qty).toEqual(0);
      expect($scope.item.price).toEqual(0);
      expect($scope.dashboardOptions.hideToolbar).toEqual(true);
      expect($scope.dashboardOptions.widgetDefinitions.length).toEqual(2);
      expect($scope.dashboardOptions.widgetDefinitions[0].name).toEqual('cartDetail');
      expect($scope.dashboardOptions.widgetDefinitions[0].title).toEqual('cart detail');
      expect($scope.dashboardOptions.widgetDefinitions[0].templateUrl).toEqual('app/template/cartDetail.html');
      expect($scope.dashboardOptions.widgetDefinitions[0].size).toBeDefined();
      expect($scope.dashboardOptions.widgetDefinitions[0].cart).toEqual($scope.cart);
      expect($scope.dashboardOptions.widgetDefinitions[1].name).toEqual('cartSummary');
      expect($scope.dashboardOptions.widgetDefinitions[1].title).toEqual('cart summary');
      expect($scope.dashboardOptions.widgetDefinitions[1].templateUrl).toEqual('app/template/cartSummary.html');
      expect($scope.dashboardOptions.widgetDefinitions[1].size).toBeDefined();
      expect($scope.dashboardOptions.widgetDefinitions[1].cart).toEqual($scope.cart);
      expect($scope.dashboardOptions.defaultWidgets).toBeDefined();
      expect($scope.dashboardOptions.storage).toBeDefined();
      expect($scope.dashboardOptions.storageId).toEqual('demo_dynamic-data');
    });

  });

  describe('the addItem method', function() {

    it('should add item to cart', function() {
      // simulate user filling the inputs and click Add
      $scope.item.name = 'Apple';
      $scope.item.qty = 2;
      $scope.item.price = .75;
      $scope.addItem();
      expect($scope.cart.items.length).toEqual(1);
      expect($scope.item.name).toEqual('');
      expect($scope.item.qty).toEqual(0);
      expect($scope.item.price).toEqual(0);
    });

    it('should not add item with blank name', function() {
      $scope.item.qty = 2;
      $scope.item.price = .75;
      $scope.addItem();
      expect($scope.cart.items.length).toEqual(0);
    });

    it('should not add item with qty 0', function() {
      $scope.item.name = 'Apple';
      $scope.item.price = .75;
      $scope.addItem();
      expect($scope.cart.items.length).toEqual(0);
    });

    it('should not add item with price 0', function() {
      $scope.item.name = 'Apple';
      $scope.item.qty = 2;
      $scope.addItem();
      expect($scope.cart.items.length).toEqual(0);
    });

  });

  describe('the autoFillCart method', function() {

    it('should fill cart with sample items', function() {
      $scope.autoFillCart();
      expect($scope.cart.items.length).toEqual(6);
    });

  });

});


describe('Controller: CartCtrl', function() {

  var $scope, $element, CartDataModel;

  beforeEach(module('app'));

  beforeEach(inject(function($rootScope, $controller, _CartDataModel_) {
    CartDataModel = _CartDataModel_;

    $scope = $rootScope.$new();

    $scope.cart = new CartDataModel();

    $scope.cart.addItem({ name: 'Apple', qty: 2, price: .55 });
    $scope.cart.addItem({ name: 'Banana', qty: 5, price: .75 });
    $scope.cart.addItem({ name: 'Orange', qty: 3, price: .35 });

    $controller('CartCtrl', { $scope: $scope });
  }));

  describe('the controller properties', function() {

    it('should have cart in scope', function() {
      expect($scope.cart.items.length).toEqual(3);
    });

  });

  describe('the removeItem method', function() {

    it('should remove one item', function() {
      $scope.removeItem($scope.cart.items[1]);
      expect($scope.cart.items.length).toEqual(2);
      expect($scope.cart.items[0].name).toEqual('Apple');
      expect($scope.cart.items[1].name).toEqual('Orange');
    });

  });

});