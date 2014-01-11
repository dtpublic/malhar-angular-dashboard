angular.module("ui.dashboard").run(["$templateCache", function($templateCache) {

  $templateCache.put("template/dashboard.html",
    "<div>\n" +
    "    <div class=\"btn-toolbar\">\n" +
    "        <div class=\"btn-group\" ng-if=\"!options.widgetButtons\">\n" +
    "            <button type=\"button\" class=\"dropdown-toggle btn btn-primary\" data-toggle=\"dropdown\">Add Widget <span\n" +
    "                    class=\"caret\"></span></button>\n" +
    "            <ul class=\"dropdown-menu\" role=\"menu\">\n" +
    "                <li ng-repeat=\"widget in options.widgetDefinitions\">\n" +
    "                    <a href=\"#\" ng-click=\"addWidgetInternal($event, widget);\"><span class=\"label label-primary\">{{widget.directive}}</span></a>\n" +
    "                </li>\n" +
    "            </ul>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"btn-group\" ng-if=\"options.widgetButtons\">\n" +
    "            <button ng-repeat=\"widget in options.widgetDefinitions\"\n" +
    "                    ng-click=\"addWidgetInternal($event, widget);\" type=\"button\" class=\"btn btn-primary\">\n" +
    "                {{widget.directive}}\n" +
    "            </button>\n" +
    "        </div>\n" +
    "\n" +
    "        <button ng-click=\"clear();\" type=\"button\" class=\"btn btn-info\">Clear</button>\n" +
    "    </div>\n" +
    "\n" +
    "    <div ui-sortable=\"sortableOptions\" ng-model=\"widgets\" class=\"dashboard-widget-area\">\n" +
    "        <div ng-repeat=\"widget in widgets\" ng-style=\"widget.style\" class=\"widget-container\">\n" +
    "            <div class=\"widget panel panel-default\" widget>\n" +
    "                <div class=\"widget-header panel-heading\">\n" +
    "                    <h3 class=\"panel-title\">\n" +
    "                        {{widget.title}} <span class=\"label label-primary\">{{widget.directive}}</span>\n" +
    "                        <span ng-click=\"removeWidget(widget);\" class=\"glyphicon glyphicon-remove\"></span>\n" +
    "                    </h3>\n" +
    "                    \n" +
    "                </div>\n" +
    "                <div class=\"widget-content panel-body\">\n" +
    "                    <div></div>\n" +
    "                </div>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "    </div>\n" +
    "</div>"
  );

}]);
