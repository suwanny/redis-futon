'use strict';

/* Controllers */

function NavCtrl($scope, $http, $rootScope) {
  $rootScope.database = 0;
}

function InfoCtrl($scope, $http, $rootScope) {
  $http.get("/redis/info").success(function(data){
    $scope.redis_info = data;
  });
  
  $scope.getDatabase = function() {
    return $rootScope.database;
  };

  
}

//MainCtrl.$inject = ['$scope', '$http'];

