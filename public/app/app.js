

'use strict';

/* App Module */

angular.module('futon', []).
  config(['$routeProvider', function($routeProvider) {
  $routeProvider.
      when('/info', {templateUrl: '/template/info.html',   controller: InfoCtrl}).
      when('/keys', {templateUrl: '/template/keys.html',   controller: KeysCtrl}).
      otherwise({redirectTo: '/info'});
}]);
