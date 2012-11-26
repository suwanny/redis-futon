

'use strict';

/* App Module */

var app = angular.module('futon', ['futonFilters']).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/info', {templateUrl: '/template/info.html',   controller: InfoCtrl}).
      when('/commands', {templateUrl: '/template/commands.html',   controller: CommandsHelpCtrl}).
      when('/database', {templateUrl: '/template/database.html',   controller: DatabaseCtrl}).
      otherwise({redirectTo: '/info'});
}]);


app.directive('onKeyup', function() {
  return function(scope, elm, attrs) {
    //Evaluate the variable that was passed
    //In this case we're just passing a variable that points
    //to a function we'll call each keyup
    var keyupFn = scope.$eval(attrs.onKeyup);
    elm.bind('keyup', function(evt) {
      //$apply makes sure that angular knows 
      //we're changing something
      scope.$apply(function() {
        keyupFn.call(scope, evt.which);
      });
    });
  };
});