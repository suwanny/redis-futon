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


function DatabaseCtrl($scope, $http, $rootScope) {

  $scope.refresh_data = function() {
    $http.get("/redis/keys").success(function(data){
      $rootScope.database = data.database;
      $scope.redis_keys = data.keys;
    });
  };

  $rootScope.$on('db_change', function (event){
    $scope.refresh_data();
  });

  $scope.refresh_data();
  
  $scope.getDatabase = function() {
    return $rootScope.database;
  };  


  var escape_quote = function (str) {
    if (str.charAt(0) === "\"" && str.charAt(str.length - 1) === "\"") {
      return str.substr(1, str.length - 2);
    }
    else {
      return str;
    }
  }

  $scope.toggleCommand = function () {
    if (jQuery("#command_slider").hasClass("hidden")) {
      jQuery("#command_slider").toggleClass("hidden");
      jQuery("#command_slider").slideDown("slow");
    }
    else {
      jQuery("#command_slider").slideUp("slow", function(){
        jQuery("#command_slider").toggleClass("hidden");
      });
    }
    
  };

  $scope.prev_commands = [];
  $scope.next_commands = [];

  $scope.execute = function() {
    var list    = $scope.command.split(" ");
    var command = list.shift();
    list        = _.map(list, function(ele) {
      return escape_quote(ele);
    });

    var data    = {command: command, args: list};

    console.log("execute: " + command);
    $http.post("/redis/command", data).success(function(data){
      var val = data.resp;
      try {
        var obj       = angular.fromJson(val);
        $scope.result = JSON.stringify(obj, null, 2);
      }
      catch(e) {
        $scope.result = val; 
      }
      
      $scope.prev_commands.push($scope.command);
      $scope.command  = "";
      $scope.refresh_data();
    });
  };

  var ARROW_UP = 38, ARROW_DOWN = 40;
  $scope.keypressCallback = function(key) {
    if (key === ARROW_UP && $scope.prev_commands.length > 0 ) {
      // show the previous command..
      $scope.next_commands.push($scope.command);
      $scope.command = $scope.prev_commands.pop();
    }
    else if (key === ARROW_DOWN && $scope.next_commands.length > 0) {
      $scope.prev_commands.push($scope.command);
      $scope.command = $scope.next_commands.pop();
    }
  };

}

//MainCtrl.$inject = ['$scope', '$http'];



