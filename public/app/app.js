

'use strict';

/* App Module */

angular.module('futon', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/info', {templateUrl: '/template/info.html',   controller: InfoCtrl}).
      when('/command', {templateUrl: '/template/command.html',   controller: CommandCtrl}).
      when('/database', {templateUrl: '/template/database.html',   controller: DatabaseCtrl}).
      otherwise({redirectTo: '/info'});
}]);
