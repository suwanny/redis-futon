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

  var parseCommandArguments = function(list) {
    // arguments parser ... 
    var args          = [];
    var _found_quote  = false;
    var _str_cache    = "";

    _.each(list, function(ele) {
      if (_found_quote) {
        _str_cache  += " " + ele;
        // if it's the end of a string, unset the flag and push the value.
        if (ele.charAt(ele.length - 1) === "\"" ) {
          _found_quote = false;
          args.push(_str_cache);
          _str_cache = "";
        }
      }
      else {
        // is string or not..
        // if the begin of a string, set the flag and cache the first one.
        if (ele.charAt(0) === "\"" ) {
          _found_quote  = true;
          _str_cache    = ele;
        }
        // if not string, just append the value.
        else {
          args.push(ele);
        }
      }
    });
    return args;
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
    var args    = _.map(parseCommandArguments(list), function(ele) {
      return escape_quote(ele);
    });
    var data    = {command: command, args: args};
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


  $scope.jsonToString = json2string; 
  $scope.show_list_result = [];
  $scope.show_hash_result = [];
  $scope.show_set_result = [];
  $scope.show_zset_result = [];

  // Show the value of a key
  $scope.showKeyValue = function(type, key) {
    if (type === "string") {
      $http.get("/redis/get/" + key).success(function(data){
        $scope.show_key = key;
        $scope.show_result   = json2string(data.resp);
        jQuery('#showValueModal').modal();
      });
    }
    else if (type === "list") {
      $http.get("/redis/list/" + key).success(function(data){
        $scope.show_key         = key;
        $scope.show_list_result = data;
        // $scope.show_list_result = _.map(data, function(ele, i) {
        //   return {key: i, value: json2string(ele)};
        // });
        jQuery('#showListModal').modal();
      });
    }
    else if (type === "set") {
      $http.get("/redis/set/" + key).success(function(data){
        $scope.show_key        = key;
        $scope.show_set_result = _.map(data, function(ele, i) {
          return {key: i, value: ele};
        });
        jQuery('#showSetModal').modal();
      });
    }
    else if (type === "hash") {
      $http.get("/redis/hash/" + key).success(function(data){
        $scope.show_key         = key;
        $scope.show_hash_result = _.map(data, function(ele, i) {
          return {key: i, value: json2string(ele)};
        });
        jQuery('#showHashModal').modal();
      });
    }
    else if (type === "zset") {
      $http.get("/redis/zset/" + key).success(function(data){
        $scope.show_key         = key;
        $scope.show_zset_result = _.map(data, function(ele) {
          return {index: ele.index, score: ele.score, value: json2string(ele.value)};
        });
        jQuery('#showSortedSetModal').modal();
      });
      
    }
  };

  $scope.list_value = "";

  $scope.showListValue = function(key, index) {
    $http.get("/redis/list/" + key + "/" + index).success(function(data){
      $scope.list_value = json2string(data);
      console.dir($scope.list_value);
    });
  };

  $scope.filterByType = function(keys, type) {
    return _.filter(keys, function(key){
      return key.type === type;
    });
  };

}

//MainCtrl.$inject = ['$scope', '$http'];



