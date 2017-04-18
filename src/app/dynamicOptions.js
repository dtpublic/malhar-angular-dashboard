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
  .controller('DynamicOptionsCtrl', function ($scope, $timeout, $window, widgetDefinitions, defaultWidgets) {
    var definitions = [{
      name: 'peopleList',
      title: 'people list',
      templateUrl: 'app/template/dynamicOptionsContainer.html',
      size: { width: '800px', minWidth: '600px', },
      includeUrl: 'app/template/peopleList.html'
    }, {
      name: 'peopleThumbnail',
      title: 'people thumbnail',
      templateUrl: 'app/template/dynamicOptionsContainer.html',
      size: { width: '1000px', minWidth: '800px', },
      includeUrl: 'app/template/peopleThumbnail.html'
    }];

    $scope.style = 'peopleList';

    var defaultWidgets = [
      { name: $scope.style }
    ];

    $scope.dashboardOptions = {
      hideToolbar: true,
      widgetDefinitions: definitions,
      defaultWidgets: defaultWidgets,
      storage: $window.localStorage,
      storageId: 'demo_dynamic-options_' + Date.now()
    };

    $scope.toggleWidget = function() {
      $scope.style = ($scope.style === 'peopleList' ? 'peopleThumbnail' : 'peopleList');

      var obj = _.cloneDeep($scope.dashboardOptions);
      obj.defaultWidgets[0].name = $scope.style;
      obj.storageId = 'demo_dynamic-options_' + Date.now();
      $timeout(function() {
        delete $scope.dashboardOptions;
      }, 0);
      $timeout(function() {
        $scope.dashboardOptions = obj;
      }, 0);
    };
  })
  .controller('PeopleCtrl', function ($scope) {
    $scope.toggleTemplate = function() {
      $scope.widget.includeUrl = ($scope.widget.includeUrl === 'app/template/peopleList.html' ? 'app/template/peopleThumbnail.html' : 'app/template/peopleList.html');
    };

    $scope.removePerson = function(person) {
      var index = _.findIndex($scope.people, function(p) {
        return p.$$hashKey === person.$$hashKey;
      });
      if (index > -1) {
        $scope.people.splice(index, 1);
      }
    };

    function generatePeople() {
      var firstNames = [ 'James', 'Christopher', 'Ronald', 'Mary', 'Lisa', 'Michelle', 'John', 'Daniel', 'Anthony', 'Patricia', 'Nancy', 'Laura' ],
          lastNames = [ 'Smith', 'Anderson', 'Clark', 'Wright', 'Mitchell', 'Johnson', 'Thomas', 'Rodriguez', 'Lopez', 'Perez' ],
          ary = [], f, l;

      while(ary.length < 10) {
        f = Math.floor(Math.random() * (firstNames.length));
        l = Math.floor(Math.random() * (lastNames.length));
        ary.push({
          name: firstNames[f] + ' ' + lastNames[l],
          email: lastNames[l].toLowerCase() + '@company.com',
          phone:  Math.random().toString().slice(2, 12).match(/^(\d{3})(\d{3})(\d{4})/).slice(1).join('-')
        });
        firstNames.splice(f, 1);
        lastNames.splice(l, 1);
      }

      return ary;
    }

    $scope.people = generatePeople();
  });