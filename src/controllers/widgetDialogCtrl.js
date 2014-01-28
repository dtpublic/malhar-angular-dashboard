'use strict';

angular.module('ui.dashboard')
  .controller('WidgetDialogCtrl', function ($scope, $modalInstance, widget, optionsTemplateUrl) {
    // add widget to scope
    $scope.widget = widget;

    // set up result object
    $scope.result = {
      title: widget.title
    };

    // look for optionsTemplateUrl on widget
    $scope.optionsTemplateUrl = optionsTemplateUrl || 'template/widget-default-content.html';

    $scope.ok = function () {
      $modalInstance.close($scope.result);
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });