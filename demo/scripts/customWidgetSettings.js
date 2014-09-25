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
  .controller('CustomSettingsDemoCtrl', function($scope, $interval, $window, widgetDefinitions, defaultWidgets, $templateCache, RandomDataModel) {

    // Setting templates to be used in this demo
    $templateCache.put('example/custom/template.html',
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="cancel()">&times;</button>' +
        '<h3>Custom Settings Dialog for <small>{{widget.title}}</small></h3>' +
        '</div>' +
        '<div class="modal-body">' +
        '<form name="form" novalidate class="form-horizontal">' +
        '<div class="form-group">' +
        '<label for="widgetTitle" class="col-sm-2 control-label">Title</label>' +
        '<div class="col-sm-10">' +
        '<input type="text" class="form-control" name="widgetTitle" ng-model="result.title">' +
        '</div>' +
        '</div>' +
        '<div ng-if="widget.partialSettingTemplateUrl" ng-include="widget.partialSettingTemplateUrl"></div>' +
        '</form>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-default" ng-click="cancel()">Cancel</button>' +
        '<button type="button" class="btn btn-primary" ng-click="ok()">OK</button>' +
        '</div>' );

    $templateCache.put('widget/specific/template.html',
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true" ng-click="cancel()">&times;</button>' +
        '<h3>Custom Settings for a special widget</h3>' +
        '</div>' +
        '<div class="modal-body">' +
        '<form name="form" novalidate class="form-horizontal">' +
        '<p>I am a settings dialog for a "special widget" widget.</p>' +
        '<div class="form-group">' +
        '<label for="widgetTitle" class="col-sm-2 control-label">Title</label>' +
        '<div class="col-sm-10">' +
        '<input type="text" class="form-control" name="widgetTitle" ng-model="result.title">' +
        '</div>' +
        '</div>' +
        '</form>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-default" ng-click="cancel()">fuhget about it</button>' +
        '<button type="button" class="btn btn-primary" ng-click="ok()">hell yea</button>' +
        '</div>' );

    // Add an additional widget with setting overrides
    var definitions = [{
      name: 'congfigurable widget',
      directive: 'wt-scope-watch',
      dataAttrName: 'value',
      dataModelType: RandomDataModel,
      dataModelOptions: {
        limit: 10
      },
      settingsModalOptions: {
        partialTemplateUrl: 'template/configurableWidgetModalOptions.html'
      },
      onSettingsClose: function (result, widget) {
        if (widget.dataModel && widget.dataModel.updateLimit) {
          widget.dataModel.updateLimit(result.dataModelOptions.limit);
        }
      }
    }, {
      name: 'override modal widget',
      directive: 'wt-scope-watch',
      dataAttrName: 'value',
      dataModelType: RandomDataModel,
      settingsModalOptions: {
        templateUrl: 'widget/specific/template.html',
        controller: 'WidgetSpecificSettingsCtrl',
        backdrop: false
      },
      onSettingsClose: function(result, widget) {
        console.log('Widget-specific settings resolved!');
        jQuery.extend(true, widget, result);
      },
      onSettingsDismiss: function(reason, scope) {
        console.log('Settings have been dismissed: ', reason);
        console.log('Dashboard scope: ', scope);
      }
    }];

    var defaultWidgets = [
      { name: 'congfigurable widget' },
      { name: 'override modal widget' }
    ];

    $scope.dashboardOptions = {
      widgetButtons: true,
      widgetDefinitions: definitions,
      defaultWidgets: defaultWidgets,
      storage: $window.localStorage,
      storageId: 'custom-settings',

      /*
      // Overrides default $modal options.
      // This can also be set on individual
      // widget definition objects (see above).
      settingsModalOptions: {
        templateUrl: 'example/custom/template.html'
        // We could pass a custom controller name here to be used
        // with the widget settings dialog, but for this demo we
        // will just keep the default.
        //
        // controller: 'CustomSettingsModalCtrl'
        //
        // Other options passed to $modal.open can be put here,
        // eg:
        //
        // backdrop: false,
        // keyboard: false
        //
        // @see http://angular-ui.github.io/bootstrap/#/modal  <-- heads up: routing on their site was broken as of this writing
      },
      */

      // Called when a widget settings dialog is closed
      // by the "ok" method (i.e., the promise is resolved
      // and not rejected). This can also be set on individual
      // widgets (see above).
      onSettingsClose: function(result, widget, scope) {
        console.log('Settings result: ', result);
        console.log('Widget: ', widget);
        console.log('Dashboard scope: ', scope);
        jQuery.extend(true, widget, result);
      },

      // Called when a widget settings dialog is closed
      // by the "cancel" method (i.e., the promise is rejected
      // and not resolved). This can also be set on individual
      // widgets (see above).
      onSettingsDismiss: function(reason, scope) {
        console.log('Settings have been dismissed: ', reason);
        console.log('Dashboard scope: ', scope);
      }
    };
  })
  .controller('WidgetSpecificSettingsCtrl', function ($scope, $modalInstance, widget) {
    // add widget to scope
    $scope.widget = widget;

    // set up result object
    $scope.result = jQuery.extend(true, {}, widget);

    $scope.ok = function () {
      console.log('calling ok from widget-specific settings controller!');
      $modalInstance.close($scope.result);
    };

    $scope.cancel = function () {
      console.log('calling cancel from widget-specific settings controller!');
      $modalInstance.dismiss('cancel');
    };
  })
