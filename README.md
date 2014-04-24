angular-dashboard
====================

[![Build Status](https://travis-ci.org/DataTorrent/malhar-angular-dashboard.svg?branch=master)](https://travis-ci.org/DataTorrent/malhar-angular-dashboard)

Dashboard/Widgets functionality with AngularJS (directive).

## Contributing

This project welcomes new contributors.

You acknowledge that your submissions to DataTorrent on this repository are made pursuant the terms of the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0.html) and constitute "Contributions," as defined therein, and you represent and warrant that you have the right and authority to do so.


## Features:
 ---------

 - Adding/removing widgets

 - Widgets are instantiated dynamically (from corresponding directive or template)

 - Widgets drag and drop (with jQuery UI Sortable)

 - Saving widgets state to local storage

 - Fluid layout (widgets can have percentage width)

 - Any directive can be a widget (e.g. AngularUI directives)

 - Connecting widgets to real-time data (WebSocket)

 - Changing widget data source dynamically (from widget options)

## Examples

[Simple demo](http://datatorrent.github.io/malhar-angular-dashboard/#/) (minimum dependencies) [[source code](demo)]

[Advanced demo](http://nickholub.github.io/angular-dashboard-app) (charts, visualization, data sources, etc.) [[source code](https://github.com/nickholub/angular-dashboard-app)]

![AngularJS Dashboard](docs/AngularJSDashboard.png "AngularJS Dashboard")

## Build

 Project is built with Grunt.

 ``` bash
    $ npm install -g grunt-cli
    $ grunt
 ```

## Requirements

- AngularJS
- Underscore.js
- jQuery
- jQuery UI
- Angular UI Sortable

Example of including dependencies from CDN [here](demo/index.html)

Getting Started
-----------------

See [simple demo](demo) (two widgets) for a quick start.

### download

With bower:

```
bower install angular-ui-dashboard
```
Manually:

Download the zip of this repo and use the files in the `dist` folder.

### include

Load `dist/angular-ui-dashboard.js` and `dist/angular-ui-dashboard.css` in your html:

```HTML
<link rel="stylesheet" href="bower_components/angular-ui-dashboard/dist/angular-ui-dashboard.css">
<script src="bower_components/angular-ui-dashboard/dist/angular-ui-dashboard.js"></script>
```

Also be sure to add it to your apps dependency list:

```JavaScript
angular.module('yourApp', [
  // other dependencies
  'angular-ui-dashboard'
]);
```

### requirements

- JQuery
- JQueryUI
- AngularJS

### usage

Include the dashboard directive on the element you wish to place widgets in:

```HTML
<div dashboard="dashboardOptions"></div>
```

#### dashboardOptions

`dashboardOptions` in the above html is required and should be an object available on the current scope. The options on said object are as follows:


key | type | default value | required | description 
--- | ---- | ------------- | -------- | -----------
 widgetDefinitions | Array | n/a | yes | List of Widget Definition Objects. See below for available options on those. 
 defaultWidgets    | Array | n/a | yes | List of objects where an object is `{ name: [NAME_OF_WIDGET_DEFINITION] }`. TODO: Allow just list of names. 
 widgetButtons     | Boolean | true | no | Display buttons for adding and removing widgets. 
 useLocalStorage   | Boolean | false | no | If true, localStorage will be used to save the current state of the dashboard. 

#### Widget Definition Objects

You can think of Widget Definition Objects as a __class__ and the widgets on the page as __instances__ of those classes. The options for a Widget Definition Object are:


key               | type     | default value | required | description 
----------------- | ------   | ------------- | -------- | -----------
name              | Object   | n/a           | true     | Name of Widget Definition Object. If no `templateUrl`, `template`, or `directive` are on the Widget Definition Object, this is assumed to be a directive name. In other words, the `directive` attribute is set to this value.
title             | String   | n/a           | false    | Default title of widget instances
attrs             | Object   | n/a           | false    | Map of attributes to add to the markup of the widget
templateUrl       | String   | n/a           | false    | URL of template to use for widget content
template          | String   | n/a           | false    | String template (ignored if templateUrl is present)
directive         | String   | n/a           | false    | HTML-injectable directive name (eg. `"ng-show"`)
dataModelType     | Function | n/a           | false    | Constructor for the dataModel object, which provides data to the widget
dataModelOptions  | Object   | n/a           | false    | Arbitrary values to supply to the dataModel. Available on dataModel instance as this.dataModelOptions
dataAttrName      | String   | n/a           | false    | Name of attribute to bind `widgetData` model


Links
-----

[Node.js](http://nodejs.org/) Software platform built on JavaScript runtime

[AngularJS](http://angularjs.org/) JavaScript framework

[ui-sortable](https://github.com/angular-ui/ui-sortable) AngularJS UI Sortable

[jQuery UI Sortable](http://jqueryui.com/sortable/) jQuery UI Sortable plugin (reordering with drag and drop)

[Bower](http://bower.io/) Package manager for the web

[Grunt](http://gruntjs.com/) JavaScript Task Runner