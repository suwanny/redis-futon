'use strict';

/* Controllers */

function DatabaseCtrl($scope, $http, $rootScope) {
  var ARROW_UP = 38, ARROW_DOWN = 40;
  $scope.prev_commands  = [];
  $scope.next_commands  = [];
  $scope.show_key       = "";
  $scope.show_result    = "";

  var escape_quote = function (str) {
    if (str.charAt(0) === "\"" && str.charAt(str.length - 1) === "\"") {
      return str.substr(1, str.length - 2);
    }
    else {
      return str;
    }
  }

  var json2string = function(str) {
    try {
      var obj = angular.fromJson(str);
      str     = JSON.stringify(obj, null, 2);
    }
    catch(e) {}
    return str;
  }

  $rootScope.$on('db_change', function (event){
    $scope.refresh_data();
  });


  $scope.refresh_data = function() {
    $http.get("/redis/keys").success(function(data){
      $rootScope.database = data.database;
      $scope.redis_keys = data.keys;
    });
  };

  $scope.refresh_data();

  
  $scope.getDatabase = function() {
    return $rootScope.database;
  };  

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


  $scope.execute = function() {
    var list    = $scope.command.split(" ");
    var command = list.shift();
    list        = _.map(list, function(ele) {
      return escape_quote(ele);
    });

    var data    = {command: command, args: list};

    console.log("execute: " + command);
    $http.post("/redis/command", data).success(function(data){
      $scope.prev_commands.push($scope.command);
      $scope.command  = "";
      $scope.result   = json2string(data.resp);
      $scope.refresh_data();
    });
  };

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

  // Show the value of a key
  $scope.showKeyValue = function(type, key) {
    console.log("ShowKeyValue key:" + key + ", type:" + type);

    if (type === "string") {
      $http.get("/redis/get/" + key).success(function(data){
        $scope.show_key = key;
        $scope.show_result   = json2string(data.resp);
        jQuery('#showValueModal').modal();
      });
    }
  };

  $scope.filterByType = function(keys, type) {
    return _.filter(keys, function(key){
      return key.type === type;
    });
  };

}

//MainCtrl.$inject = ['$scope', '$http'];



