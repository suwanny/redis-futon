'use strict';

/* Controllers */

function NavCtrl($scope, $http, $rootScope) {
  $rootScope.database = 0;

  $scope.db_range = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  $scope.selectDatabase = function(db) {
    $http.get("/redis/select/" + db).success(function(data){
      $rootScope.database = db;
      $rootScope.$emit("db_change", db);
    })
  }

  $scope.getCurrentDatabase = function() {
    return $rootScope.database;
  }; 

  
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



