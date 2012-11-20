

'use strict';

/* App Module */

angular.module('futon', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/info', {templateUrl: '/template/info.html',   controller: InfoCtrl}).
      otherwise({redirectTo: '/info'});
}]);
