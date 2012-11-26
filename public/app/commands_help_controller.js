'use strict';

/* Controllers */

function CommandsHelpCtrl($scope, $http, $rootScope) {

  // Duplicated Codes in the database controller
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


  // Commands Help from Redis.IO
  $scope.commands = [
    {
      name: "append",
      url: "http://redis.io/commands/append",
      usage: "APPEND key value",
      description: "If key already exists and is a string, this command appends the value at the end of the string. If key does not exist it is created and set as an empty string, so APPEND will be similar to SET in this special case.",
      return_val: "Integer reply: the length of the string after the append operation.",
      patterns: "Time series"
    },
    {
      name: "bgrewriteaof",
      url: "http://redis.io/commands/bgrewriteaof",
      usage: "BGREWRITEAOF",
      description: "Instruct Redis to start an Append Only File rewrite process. The rewrite will create a small optimized version of the current Append Only File.",
      return_val: "Status code reply: always OK.",
      patterns: ""
    },
    {
      name: "bgsave",
      url: "http://redis.io/commands/bgsave",
      usage: "BGSAVE",
      description: "Save the DB in background. The OK code is immediately returned. Redis forks, the parent continues to serve the clients, the child saves the DB on disk then exits. A client my be able to check if the operation succeeded using the LASTSAVE command.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "bitcount",
      url: "http://redis.io/commands/bitcount",
      usage: "BITCOUNT key [start] [end]",
      description: "Count the number of set bits (population counting) in a string.",
      return_val: "Integer reply. The number of bits set to 1.",
      patterns: "real-time metrics using bitmaps"
    },
    {
      name: "bitop",
      url: "http://redis.io/commands/bitop",
      usage: "BITOP operation destkey key [key ...]",
      description: "Perform a bitwise operation between multiple keys (containing string values) and store the result in the destination key.",
      return_val: "The size of the string stored in the destination key, that is equal to the size of the longest input string",
      patterns: "real time metrics using bitmaps"
    },
    {
      name: "blpop",
      url: "http://redis.io/commands/blpop",
      usage: "BLPOP key [key ...] timeout",
      description: "BLPOP is a blocking list pop primitive. It is the blocking version of LPOP because it blocks the connection when there are no elements to pop from any of the given lists. An element is popped from the head of the first list that is non-empty, with the given keys being checked in the order that they are given.",
      return_val: "Multi-bulk reply: specifically:",
      patterns: "Event notification"
    },
    {
      name: "brpop",
      url: "http://redis.io/commands/brpop",
      usage: "BRPOP key [key ...] timeout",
      description: "BRPOP is a blocking list pop primitive. It is the blocking version of RPOP because it blocks the connection when there are no elements to pop from any of the given lists. An element is popped from the tail of the first list that is non-empty, with the given keys being checked in the order that they are given.",
      return_val: "A two-element multi-bulk with the first element being the name of the key where an element was popped and the second element being the value of the popped element.",
      patterns: ""
    },
    {
      name: "brpoplpush",
      url: "http://redis.io/commands/brpoplpush",
      usage: "BRPOPLPUSH source destination timeout",
      description: "BRPOPLPUSH is the blocking variant of RPOPLPUSH. When source contains elements, this command behaves exactly like RPOPLPUSH. When source is empty, Redis will block the connection until another client pushes to it or until timeout is reached. A timeout of zero can be used to block indefinitely.",
      return_val: "Bulk reply: the element being popped from source and pushed to destination. If timeout is reached, a Null multi-bulk reply is returned.",
      patterns: "Reliable queue, Circular list"
    },
    {
      name: "dbsize",
      url: "http://redis.io/commands/dbsize",
      usage: "DBSIZE",
      description: "Return the number of keys in the currently-selected database.",
      return_val: "Integer reply",
      patterns: ""
    },
    {
      name: "decr",
      url: "http://redis.io/commands/decr",
      usage: "DECR key",
      description: "Decrements the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation. An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer. This operation is limited to 64 bit signed integers.",
      return_val: "Integer reply: the value of key after the decrement",
      patterns: ""
    },
    {
      name: "decrby",
      url: "http://redis.io/commands/decrby",
      usage: "DECRBY key decrement",
      description: "Decrements the number stored at key by decrement. If the key does not exist, it is set to 0 before performing the operation. An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer. This operation is limited to 64 bit signed integers.",
      return_val: "Integer reply: the value of key after the decrement",
      patterns: ""
    },
    {
      name: "del",
      url: "http://redis.io/commands/del",
      usage: "DEL key [key ...]",
      description: "Removes the specified keys. A key is ignored if it does not exist.",
      return_val: "Integer reply: The number of keys that were removed.",
      patterns: ""
    },
    {
      name: "discard",
      url: "http://redis.io/commands/discard",
      usage: "DISCARD",
      description: "Flushes all previously queued commands in a transaction and restores the connection state to normal.",
      return_val: "Status code reply: always OK.",
      patterns: ""
    },
    {
      name: "dump",
      url: "http://redis.io/commands/dump",
      usage: "DUMP key",
      description: "Serialize the value stored at key in a Redis-specific format and return it to the user. The returned value can be synthesized back into a Redis key using the RESTORE command.",
      return_val: "Bulk reply: the serialized value.",
      patterns: ""
    },
    {
      name: "exec",
      url: "http://redis.io/commands/exec",
      usage: "EXEC",
      description: "Executes all previously queued commands in a transaction and restores the connection state to normal.",
      return_val: "Multi-bulk reply: each element being the reply to each of the commands in the atomic transaction.",
      patterns: ""
    },
    {
      name: "exists",
      url: "http://redis.io/commands/exists",
      usage: "EXISTS key",
      description: "Returns if key exists.",
      return_val: "1 if the key exists, 0 if the key does not exist.",
      patterns: ""
    },
    {
      name: "expire",
      url: "http://redis.io/commands/expire",
      usage: "EXPIRE key seconds",
      description: "Set a timeout on key. After the timeout has expired, the key will automatically be deleted. A key with an associated timeout is often said to be volatile in Redis terminology.",
      return_val: "1 if the timeout was set. 0 if key does not exist or the timeout could not be set.",
      patterns: ""
    },
    {
      name: "expireat",
      url: "http://redis.io/commands/expireat",
      usage: "EXPIREAT key timestamp",
      description: "EXPIREAT has the same effect and semantic as EXPIRE, but instead of specifying the number of seconds representing the TTL (time to live), it takes an absolute Unix timestamp (seconds since January 1, 1970).",
      return_val: "1 if the timeout was set. 0 if key does not exist or the timeout could not be set.",
      patterns: ""
    },
    {
      name: "flushall",
      url: "http://redis.io/commands/flushall",
      usage: "FLUSHALL",
      description: "Delete all the keys of all the existing databases, not just the currently selected one. This command never fails.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "flushdb",
      url: "http://redis.io/commands/flushdb",
      usage: "FLUSHDB",
      description: "Delete all the keys of the currently selected DB. This command never fails.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "get",
      url: "http://redis.io/commands/get",
      usage: "GET key",
      description: "Get the value of key. If the key does not exist the special value nil is returned. An error is returned if the value stored at key is not a string, because GET only handles string values.",
      return_val: "Bulk reply: the value of key, or nil when key does not exist.",
      patterns: ""
    },
    {
      name: "getbit",
      url: "http://redis.io/commands/getbit",
      usage: "GETBIT key offset",
      description: "Returns the bit value at offset in the string value stored at key.",
      return_val: "Integer reply: the bit value stored at offset.",
      patterns: ""
    },
    {
      name: "getrange",
      url: "http://redis.io/commands/getrange",
      usage: "GETRANGE key start end",
      description: "Returns the substring of the string value stored at key, determined by the offsets start and end (both are inclusive). Negative offsets can be used in order to provide an offset starting from the end of the string. So -1 means the last character, -2 the penultimate and so forth.",
      return_val: "Bulk reply",
      patterns: ""
    },
    {
      name: "getset",
      url: "http://redis.io/commands/getset",
      usage: "GETSET key value",
      description: "Atomically sets key to value and returns the old value stored at key. Returns an error when key exists but does not hold a string value.",
      return_val: "Bulk reply: the old value stored at key, or nil when key did not exist.",
      patterns: ""
    },
    {
      name: "hdel",
      url: "http://redis.io/commands/hdel",
      usage: "HDEL key field [field ...]",
      description: "Removes the specified fields from the hash stored at key. Specified fields that do not exist within this hash are ignored. If key does not exist, it is treated as an empty hash and this command returns 0.",
      return_val: "Integer reply: the number of fields that were removed from the hash, not including specified but non existing fields.",
      patterns: ""
    },
    {
      name: "hexists",
      url: "http://redis.io/commands/hexists",
      usage: "HEXISTS key field",
      description: "Returns if field is an existing field in the hash stored at key.",
      return_val: "1 if the hash contains field.",
      patterns: ""
    },
    {
      name: "hget",
      url: "http://redis.io/commands/hget",
      usage: "HGET key field",
      description: "Returns the value associated with field in the hash stored at key.",
      return_val: "Bulk reply: the value associated with field, or nil when field is not present in the hash or key does not exist.",
      patterns: ""
    },
    {
      name: "hgetall",
      url: "http://redis.io/commands/hgetall",
      usage: "HGETALL key",
      description: "Returns all fields and values of the hash stored at key. In the returned value, every field name is followed by its value, so the length of the reply is twice the size of the hash.",
      return_val: "Multi-bulk reply: list of fields and their values stored in the hash, or an empty list when key does not exist.",
      patterns: ""
    },
    {
      name: "hincrby",
      url: "http://redis.io/commands/hincrby",
      usage: "HINCRBY key field increment",
      description: "Increments the number stored at field in the hash stored at key by increment. If key does not exist, a new key holding a hash is created. If field does not exist the value is set to 0 before the operation is performed.",
      return_val: "Integer reply: the value at field after the increment operation.",
      patterns: ""
    },
    {
      name: "hincrbyfloat",
      url: "http://redis.io/commands/hincrbyfloat",
      usage: "HINCRBYFLOAT key field increment",
      description: "Increment the specified field of an hash stored at key, and representing a floating point number, by the specified increment. If the field does not exist, it is set to 0 before performing the operation. An error is returned if one of the following conditions occur:",
      return_val: "Bulk reply: the value of field after the increment.",
      patterns: ""
    },
    {
      name: "hkeys",
      url: "http://redis.io/commands/hkeys",
      usage: "HKEYS key",
      description: "Returns all field names in the hash stored at key.",
      return_val: "Multi-bulk reply: list of fields in the hash, or an empty list when key does not exist.",
      patterns: ""
    },
    {
      name: "hlen",
      url: "http://redis.io/commands/hlen",
      usage: "HLEN key",
      description: "Returns the number of fields contained in the hash stored at key.",
      return_val: "Integer reply: number of fields in the hash, or 0 when key does not exist.",
      patterns: ""
    },
    {
      name: "hmget",
      url: "http://redis.io/commands/hmget",
      usage: "HMGET key field [field ...]",
      description: "Returns the values associated with the specified fields in the hash stored at key.",
      return_val: "Multi-bulk reply: list of values associated with the given fields, in the same order as they are requested.",
      patterns: ""
    },
    {
      name: "hmset",
      url: "http://redis.io/commands/hmset",
      usage: "HMSET key field value [field value ...]",
      description: "Sets the specified fields to their respective values in the hash stored at key. This command overwrites any existing fields in the hash. If key does not exist, a new key holding a hash is created.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "hset",
      url: "http://redis.io/commands/hset",
      usage: "HSET key field value",
      description: "Sets field in the hash stored at key to value. If key does not exist, a new key holding a hash is created. If field already exists in the hash, it is overwritten.",
      return_val: "1 if field is a new field in the hash and value was set.",
      patterns: ""
    },
    {
      name: "hsetnx",
      url: "http://redis.io/commands/hsetnx",
      usage: "HSETNX key field value",
      description: "Sets field in the hash stored at key to value, only if field does not yet exist. If key does not exist, a new key holding a hash is created. If field already exists, this operation has no effect.",
      return_val: "1 if field is a new field in the hash and value was set.",
      patterns: ""
    },
    {
      name: "hvals",
      url: "http://redis.io/commands/hvals",
      usage: "HVALS key",
      description: "Returns all values in the hash stored at key.",
      return_val: "Multi-bulk reply: list of values in the hash, or an empty list when key does not exist.",
      patterns: ""
    },
    {
      name: "incr",
      url: "http://redis.io/commands/incr",
      usage: "INCR key",
      description: "Increments the number stored at key by one. If the key does not exist, it is set to 0 before performing the operation. An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer. This operation is limited to 64 bit signed integers.",
      return_val: "Integer reply: the value of key after the increment",
      patterns: ""
    },
    {
      name: "incrby",
      url: "http://redis.io/commands/incrby",
      usage: "INCRBY key increment",
      description: "Increments the number stored at key by increment. If the key does not exist, it is set to 0 before performing the operation. An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer. This operation is limited to 64 bit signed integers.",
      return_val: "Integer reply: the value of key after the increment",
      patterns: ""
    },
    {
      name: "incrbyfloat",
      url: "http://redis.io/commands/incrbyfloat",
      usage: "INCRBYFLOAT key increment",
      description: "Increment the string representing a floating point number stored at key by the specified increment. If the key does not exist, it is set to 0 before performing the operation. An error is returned if one of the following conditions occur:",
      return_val: "Bulk reply: the value of key after the increment.",
      patterns: ""
    },
    {
      name: "keys",
      url: "http://redis.io/commands/keys",
      usage: "KEYS pattern",
      description: "Returns all keys matching pattern.",
      return_val: "Multi-bulk reply: list of keys matching pattern.",
      patterns: ""
    },
    {
      name: "lindex",
      url: "http://redis.io/commands/lindex",
      usage: "LINDEX key index",
      description: "Returns the element at index index in the list stored at key. The index is zero-based, so 0 means the first element, 1 the second element and so on. Negative indices can be used to designate elements starting at the tail of the list. Here, -1 means the last element, -2 means the penultimate and so forth.",
      return_val: "Bulk reply: the requested element, or nil when index is out of range.",
      patterns: ""
    },
    {
      name: "linsert",
      url: "http://redis.io/commands/linsert",
      usage: "LINSERT key BEFORE|AFTER pivot value",
      description: "Inserts value in the list stored at key either before or after the reference value pivot.",
      return_val: "Integer reply: the length of the list after the insert operation, or -1 when the value pivot was not found.",
      patterns: ""
    },
    {
      name: "llen",
      url: "http://redis.io/commands/llen",
      usage: "LLEN key",
      description: "Returns the length of the list stored at key. If key does not exist, it is interpreted as an empty list and 0 is returned. An error is returned when the value stored at key is not a list.",
      return_val: "Integer reply: the length of the list at key.",
      patterns: ""
    },
    {
      name: "lpop",
      url: "http://redis.io/commands/lpop",
      usage: "LPOP key",
      description: "Removes and returns the first element of the list stored at key.",
      return_val: "Bulk reply: the value of the first element, or nil when key does not exist.",
      patterns: ""
    },
    {
      name: "lpush",
      url: "http://redis.io/commands/lpush",
      usage: "LPUSH key value [value ...]",
      description: "Insert all the specified values at the head of the list stored at key. If key does not exist, it is created as empty list before performing the push operations. When key holds a value that is not a list, an error is returned.",
      return_val: "Integer reply: the length of the list after the push operations.",
      patterns: ""
    },
    {
      name: "lpushx",
      url: "http://redis.io/commands/lpushx",
      usage: "LPUSHX key value",
      description: "Inserts value at the head of the list stored at key, only if key already exists and holds a list. In contrary to LPUSH, no operation will be performed when key does not yet exist.",
      return_val: "Integer reply: the length of the list after the push operation.",
      patterns: ""
    },
    {
      name: "lrange",
      url: "http://redis.io/commands/lrange",
      usage: "LRANGE key start stop",
      description: "Returns the specified elements of the list stored at key. The offsets start and stop are zero-based indexes, with 0 being the first element of the list (the head of the list), 1 being the next element and so on.",
      return_val: "Multi-bulk reply: list of elements in the specified range.",
      patterns: ""
    },
    {
      name: "lrem",
      url: "http://redis.io/commands/lrem",
      usage: "LREM key count value",
      description: "Removes the first count occurrences of elements equal to value from the list stored at key. The count argument influences the operation in the following ways:",
      return_val: "Integer reply: the number of removed elements.",
      patterns: ""
    },
    {
      name: "lset",
      url: "http://redis.io/commands/lset",
      usage: "LSET key index value",
      description: "Sets the list element at index to value. For more information on the index argument, see LINDEX.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "ltrim",
      url: "http://redis.io/commands/ltrim",
      usage: "LTRIM key start stop",
      description: "Trim an existing list so that it will contain only the specified range of elements specified. Both start and stop are zero-based indexes, where 0 is the first element of the list (the head), 1 the next element and so on.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "mget",
      url: "http://redis.io/commands/mget",
      usage: "MGET key [key ...]",
      description: "Returns the values of all specified keys. For every key that does not hold a string value or does not exist, the special value nil is returned. Because of this, the operation never fails.",
      return_val: "Multi-bulk reply: list of values at the specified keys.",
      patterns: ""
    },
    {
      name: "move",
      url: "http://redis.io/commands/move",
      usage: "MOVE key db",
      description: "Move key from the currently selected database (see SELECT) to the specified destination database. When key already exists in the destination database, or it does not exist in the source database, it does nothing. It is possible to use MOVE as a locking primitive because of this.",
      return_val: "1 if key was moved.",
      patterns: ""
    },
    {
      name: "mset",
      url: "http://redis.io/commands/mset",
      usage: "MSET key value [key value ...]",
      description: "Sets the given keys to their respective values. MSET replaces existing values with new values, just as regular SET. See MSETNX if you don't want to overwrite existing values.",
      return_val: "Status code reply: always OK since MSET can't fail.",
      patterns: ""
    },
    {
      name: "msetnx",
      url: "http://redis.io/commands/msetnx",
      usage: "MSETNX key value [key value ...]",
      description: "Sets the given keys to their respective values. MSETNX will not perform any operation at all even if just a single key already exists.",
      return_val: "1 if the all the keys were set.",
      patterns: ""
    },
    {
      name: "multi",
      url: "http://redis.io/commands/multi",
      usage: "MULTI",
      description: "Marks the start of a transaction block. Subsequent commands will be queued for atomic execution using EXEC.",
      return_val: "Status code reply: always OK.",
      patterns: ""
    },
    {
      name: "object",
      url: "http://redis.io/commands/object",
      usage: "OBJECT subcommand [arguments [arguments ...]]",
      description: "The OBJECT command allows to inspect the internals of Redis Objects associated with keys. It is useful for debugging or to understand if your keys are using the specially encoded data types to save space. Your application may also use the information reported by the OBJECT command to implement application level key eviction policies when using Redis as a Cache. [REFCOUNT|ENCODING|IDLETIME]",
      return_val: "Subcommands refcount and idletime returns integers. / Subcommand encoding returns a bulk reply.",
      patterns: ""
    },
    {
      name: "persist",
      url: "http://redis.io/commands/persist",
      usage: "PERSIST key",
      description: "Remove the existing timeout on key, turning the key from volatile (a key with an expire set) to persistent (a key that will never expire as no timeout is associated).",
      return_val: "1 if the timeout was removed.",
      patterns: ""
    },
    {
      name: "pexpire",
      url: "http://redis.io/commands/pexpire",
      usage: "PEXPIRE key milliseconds",
      description: "This command works exactly like EXPIRE but the time to live of the key is specified in milliseconds instead of seconds.",
      return_val: "1 if the timeout was set",
      patterns: ""
    },
    {
      name: "pexpireat",
      url: "http://redis.io/commands/pexpireat",
      usage: "PEXPIREAT key milliseconds-timestamp",
      description: "PEXPIREAT has the same effect and semantic as EXPIREAT, but the Unix time at which the key will expire is specified in milliseconds instead of seconds.",
      return_val: "1 if the timeout was set.",
      patterns: ""
    },
    {
      name: "psetex",
      url: "http://redis.io/commands/psetex",
      usage: "PSETEX key milliseconds value",
      description: "PSETEX works exactly like SETEX with the sole difference that the expire time is specified in milliseconds instead of seconds.",
      return_val: "",
      patterns: ""
    },
    {
      name: "psubscribe",
      url: "http://redis.io/commands/psubscribe",
      usage: "PSUBSCRIBE pattern [pattern ...]",
      description: "Subscribes the client to the given patterns.",
      return_val: "",
      patterns: ""
    },
    {
      name: "pttl",
      url: "http://redis.io/commands/pttl",
      usage: "PTTL key",
      description: "Like TTL this command returns the remaining time to live of a key that has an expire set, with the sole difference that TTL returns the amount of remaining time in seconds while PTTL returns it in milliseconds.",
      return_val: "Integer reply: Time to live in milliseconds or -1 when key does not exist or does not have a timeout.",
      patterns: ""
    },
    {
      name: "publish",
      url: "http://redis.io/commands/publish",
      usage: "PUBLISH channel message",
      description: "Posts a message to the given channel.",
      return_val: "Integer reply: the number of clients that received the message.",
      patterns: ""
    },
    {
      name: "punsubscribe",
      url: "http://redis.io/commands/punsubscribe",
      usage: "PUNSUBSCRIBE [pattern [pattern ...]]",
      description: "Unsubscribes the client from the given patterns, or from all of them if none is given.",
      return_val: "",
      patterns: ""
    },
    {
      name: "randomkey",
      url: "http://redis.io/commands/randomkey",
      usage: "RANDOMKEY",
      description: "Return a random key from the currently selected database.",
      return_val: "Bulk reply: the random key, or nil when the database is empty.",
      patterns: ""
    },
    {
      name: "rename",
      url: "http://redis.io/commands/rename",
      usage: "RENAME key newkey",
      description: "Renames key to newkey. It returns an error when the source and destination names are the same, or when key does not exist. If newkey already exists it is overwritten.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "renamenx",
      url: "http://redis.io/commands/renamenx",
      usage: "RENAMENX key newkey",
      description: "Renames key to newkey if newkey does not yet exist. It returns an error under the same conditions as RENAME.",
      return_val: "1 if key was renamed to newkey",
      patterns: ""
    },
    {
      name: "restore",
      url: "http://redis.io/commands/restore",
      usage: "RESTORE key ttl serialized-value",
      description: "Create a key associated with a value that is obtained by deserializing the provided serialized value (obtained via DUMP).",
      return_val: "Status code reply: The command returns OK on success.",
      patterns: ""
    },
    {
      name: "rpop",
      url: "http://redis.io/commands/rpop",
      usage: "RPOP key",
      description: "Removes and returns the last element of the list stored at key.",
      return_val: "Bulk reply: the value of the last element, or nil when key does not exist.",
      patterns: ""
    },
    {
      name: "rpoplpush",
      url: "http://redis.io/commands/rpoplpush",
      usage: "RPOPLPUSH source destination",
      description: "Atomically returns and removes the last element (tail) of the list stored at source, and pushes the element at the first element (head) of the list stored at destination.",
      return_val: "Bulk reply: the element being popped and pushed.",
      patterns: ""
    },
    {
      name: "rpush",
      url: "http://redis.io/commands/rpush",
      usage: "RPUSH key value [value ...]",
      description: "Insert all the specified values at the tail of the list stored at key. If key does not exist, it is created as empty list before performing the push operation. When key holds a value that is not a list, an error is returned.",
      return_val: "Integer reply: the length of the list after the push operation.",
      patterns: ""
    },
    {
      name: "rpushx",
      url: "http://redis.io/commands/rpushx",
      usage: "RPUSHX key value",
      description: "Inserts value at the tail of the list stored at key, only if key already exists and holds a list. In contrary to RPUSH, no operation will be performed when key does not yet exist.",
      return_val: "Integer reply: the length of the list after the push operation.",
      patterns: ""
    },
    {
      name: "sadd",
      url: "http://redis.io/commands/sadd",
      usage: "SADD key member [member ...]",
      description: "Add the specified members to the set stored at key. Specified members that are already a member of this set are ignored. If key does not exist, a new set is created before adding the specified members.",
      return_val: "Integer reply: the number of elements that were added to the set, not including all the elements already present into the set.",
      patterns: ""
    },
    {
      name: "scard",
      url: "http://redis.io/commands/scard",
      usage: "SCARD key",
      description: "Returns the set cardinality (number of elements) of the set stored at key.",
      return_val: "Integer reply: the cardinality (number of elements) of the set, or 0 if key does not exist.",
      patterns: ""
    },
    {
      name: "sdiff",
      url: "http://redis.io/commands/sdiff",
      usage: "SDIFF key [key ...]",
      description: "Returns the members of the set resulting from the difference between the first set and all the successive sets.",
      return_val: "Multi-bulk reply: list with members of the resulting set.",
      patterns: ""
    },
    {
      name: "sdiffstore",
      url: "http://redis.io/commands/sdiffstore",
      usage: "SDIFFSTORE destination key [key ...]",
      description: "This command is equal to SDIFF, but instead of returning the resulting set, it is stored in destination.",
      return_val: "Integer reply: the number of elements in the resulting set.",
      patterns: ""
    },
    {
      name: "select",
      url: "http://redis.io/commands/select",
      usage: "SELECT index",
      description: "Select the DB with having the specified zero-based numeric index. New connections always use DB 0.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "set",
      url: "http://redis.io/commands/set",
      usage: "SET key value",
      description: "Set key to hold the string value. If key already holds a value, it is overwritten, regardless of its type.",
      return_val: "Status code reply: always OK since SET can't fail.",
      patterns: ""
    },
    {
      name: "setbit",
      url: "http://redis.io/commands/setbit",
      usage: "SETBIT key offset value",
      description: "Sets or clears the bit at offset in the string value stored at key.",
      return_val: "Integer reply: the original bit value stored at offset.",
      patterns: ""
    },
    {
      name: "setex",
      url: "http://redis.io/commands/setex",
      usage: "SETEX key seconds value",
      description: "Set key to hold the string value and set key to timeout after a given number of seconds. This command is equivalent to executing the following commands: SET mykey value && EXPIRE mykey seconds",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "setnx",
      url: "http://redis.io/commands/setnx",
      usage: "SETNX key value",
      description: "Set key to hold string value if key does not exist. In that case, it is equal to SET. When key already holds a value, no operation is performed. SETNX is short for \"SET if N ot e X ists\".",
      return_val: "1 if the key was set",
      patterns: ""
    },
    {
      name: "setrange",
      url: "http://redis.io/commands/setrange",
      usage: "SETRANGE key offset value",
      description: "Overwrites part of the string stored at key, starting at the specified offset, for the entire length of value. If the offset is larger than the current length of the string at key, the string is padded with zero-bytes to make offset fit. Non-existing keys are considered as empty strings, so this command will make sure it holds a string large enough to be able to set value at offset.",
      return_val: "Integer reply: the length of the string after it was modified by the command.",
      patterns: ""
    },
    {
      name: "sinter",
      url: "http://redis.io/commands/sinter",
      usage: "SINTER key [key ...]",
      description: "Returns the members of the set resulting from the intersection of all the given sets.",
      return_val: "Multi-bulk reply: list with members of the resulting set.",
      patterns: ""
    },
    {
      name: "sinterstore",
      url: "http://redis.io/commands/sinterstore",
      usage: "SINTERSTORE destination key [key ...]",
      description: "This command is equal to SINTER, but instead of returning the resulting set, it is stored in destination.",
      return_val: "Integer reply: the number of elements in the resulting set.",
      patterns: ""
    },
    {
      name: "sismember",
      url: "http://redis.io/commands/sismember",
      usage: "SISMEMBER key member",
      description: "Returns if member is a member of the set stored at key.",
      return_val: "1 if the element is a member of the set.",
      patterns: ""
    },
    {
      name: "smembers",
      url: "http://redis.io/commands/smembers",
      usage: "SMEMBERS key",
      description: "Returns all the members of the set value stored at key.",
      return_val: "Multi-bulk reply: all elements of the set.",
      patterns: ""
    },
    {
      name: "smove",
      url: "http://redis.io/commands/smove",
      usage: "SMOVE source destination member",
      description: "Move member from the set at source to the set at destination. This operation is atomic. In every given moment the element will appear to be a member of source or destination for other clients.",
      return_val: "1 if the element is moved.",
      patterns: ""
    },
    {
      name: "sort",
      url: "http://redis.io/commands/sort",
      usage: "SORT key [BY pattern] [LIMIT offset count] [GET pattern [GET pattern ...]] [ASC|DESC] [ALPHA] [STORE destination]",
      description: "Returns or stores the elements contained in the list, set or sorted set at key. By default, sorting is numeric and elements are compared by their value interpreted as double precision floating point number. This is SORT in its simplest form:",
      return_val: "Multi-bulk reply: list of sorted elements.",
      patterns: ""
    },
    {
      name: "spop",
      url: "http://redis.io/commands/spop",
      usage: "SPOP key",
      description: "Removes and returns a random element from the set value stored at key.",
      return_val: "Bulk reply: the removed element, or nil when key does not exist.",
      patterns: ""
    },
    {
      name: "srandmember",
      url: "http://redis.io/commands/srandmember",
      usage: "SRANDMEMBER key [count]",
      description: "When called with just the key argument, return a random element from the set value stored at key.",
      return_val: "Bulk reply: without the additional count argument the command returns a Bulk Reply with the randomly selected element, or nil when key does not exist. Multi-bulk reply: when the additional count argument is passed the command returns an array of elements, or an empty array when key does not exist.",
      patterns: ""
    },
    {
      name: "srem",
      url: "http://redis.io/commands/srem",
      usage: "SREM key member [member ...]",
      description: "Remove the specified members from the set stored at key. Specified members that are not a member of this set are ignored. If key does not exist, it is treated as an empty set and this command returns 0.",
      return_val: "Integer reply: the number of members that were removed from the set, not including non existing members.",
      patterns: ""
    },
    {
      name: "strlen",
      url: "http://redis.io/commands/strlen",
      usage: "STRLEN key",
      description: "Returns the length of the string value stored at key. An error is returned when key holds a non-string value.",
      return_val: "Integer reply: the length of the string at key, or 0 when key does not exist.",
      patterns: ""
    },
    {
      name: "subscribe",
      url: "http://redis.io/commands/subscribe",
      usage: "SUBSCRIBE channel [channel ...]",
      description: "Subscribes the client to the specified channels.",
      return_val: "Once the client enters the subscribed state it is not supposed to issue any other commands, except for additional SUBSCRIBE, PSUBSCRIBE, UNSUBSCRIBE and PUNSUBSCRIBE commands.",
      patterns: ""
    },
    {
      name: "sunion",
      url: "http://redis.io/commands/sunion",
      usage: "SUNION key [key ...]",
      description: "Returns the members of the set resulting from the union of all the given sets.",
      return_val: "Multi-bulk reply: list with members of the resulting set.",
      patterns: ""
    },
    {
      name: "sunionstore",
      url: "http://redis.io/commands/sunionstore",
      usage: "SUNIONSTORE destination key [key ...]",
      description: "This command is equal to SUNION, but instead of returning the resulting set, it is stored in destination.",
      return_val: "Integer reply: the number of elements in the resulting set.",
      patterns: ""
    },
    {
      name: "ttl",
      url: "http://redis.io/commands/ttl",
      usage: "TTL key",
      description: "Returns the remaining time to live of a key that has a timeout. This introspection capability allows a Redis client to check how many seconds a given key will continue to be part of the dataset.",
      return_val: "Integer reply: TTL in seconds or -1 when key does not exist or does not have a timeout.",
      patterns: ""
    },
    {
      name: "type",
      url: "http://redis.io/commands/type",
      usage: "TYPE key",
      description: "Returns the string representation of the type of the value stored at key. The different types that can be returned are: string, list, set, zset and hash.",
      return_val: "Status code reply: type of key, or none when key does not exist.",
      patterns: ""
    },
    {
      name: "unsubscribe",
      url: "http://redis.io/commands/unsubscribe",
      usage: "UNSUBSCRIBE [channel [channel ...]]",
      description: "Unsubscribes the client from the given channels, or from all of them if none is given.",
      return_val: "When no channels are specified, the client is unsubscribed from all the previously subscribed channels. In this case, a message for every unsubscribed channel will be sent to the client.",
      patterns: ""
    },
    {
      name: "unwatch",
      url: "http://redis.io/commands/unwatch",
      usage: "UNWATCH",
      description: "Flushes all the previously watched keys for a transaction.",
      return_val: "Status code reply: always OK.",
      patterns: ""
    },
    {
      name: "watch",
      url: "http://redis.io/commands/watch",
      usage: "WATCH key [key ...]",
      description: "Marks the given keys to be watched for conditional execution of a transaction.",
      return_val: "Status code reply: always OK.",
      patterns: ""
    },
    {
      name: "zadd",
      url: "http://redis.io/commands/zadd",
      usage: "ZADD key score member [score] [member]",
      description: "Adds all the specified members with the specified scores to the sorted set stored at key. It is possible to specify multiple score/member pairs. If a specified member is already a member of the sorted set, the score is updated and the element reinserted at the right position to ensure the correct ordering. If key does not exist, a new sorted set with the specified members as sole members is created, like if the sorted set was empty. If the key exists but does not hold a sorted set, an error is returned.",
      return_val: "The number of elements added to the sorted sets, not including elements already existing for which the score was updated.",
      patterns: ""
    },
    {
      name: "zcard",
      url: "http://redis.io/commands/zcard",
      usage: "ZCARD key",
      description: "Returns the sorted set cardinality (number of elements) of the sorted set stored at key.",
      return_val: "Integer reply: the cardinality (number of elements) of the sorted set, or 0 if key does not exist.",
      patterns: ""
    },
    {
      name: "zcount",
      url: "http://redis.io/commands/zcount",
      usage: "ZCOUNT key min max",
      description: "Returns the number of elements in the sorted set at key with a score between min and max.",
      return_val: "Integer reply: the number of elements in the specified score range.",
      patterns: ""
    },
    {
      name: "zincrby",
      url: "http://redis.io/commands/zincrby",
      usage: "ZINCRBY key increment member",
      description: "Increments the score of member in the sorted set stored at key by increment. If member does not exist in the sorted set, it is added with increment as its score (as if its previous score was 0.0). If key does not exist, a new sorted set with the specified member as its sole member is created.",
      return_val: "Bulk reply: the new score of member (a double precision floating point number), represented as string.",
      patterns: ""
    },
    {
      name: "zinterstore",
      url: "http://redis.io/commands/zinterstore",
      usage: "ZINTERSTORE destination numkeys key [key ...] [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]",
      description: "Computes the intersection of numkeys sorted sets given by the specified keys, and stores the result in destination. It is mandatory to provide the number of input keys (numkeys) before passing the input keys and the other (optional) arguments.",
      return_val: "Integer reply: the number of elements in the resulting sorted set at destination.",
      patterns: ""
    },
    {
      name: "zrange",
      url: "http://redis.io/commands/zrange",
      usage: "ZRANGE key start stop [WITHSCORES]",
      description: "Returns the specified range of elements in the sorted set stored at key. The elements are considered to be ordered from the lowest to the highest score. Lexicographical order is used for elements with equal score.",
      return_val: "Multi-bulk reply: list of elements in the specified range (optionally with their scores).",
      patterns: ""
    },
    {
      name: "zrangebyscore",
      url: "http://redis.io/commands/zrangebyscore",
      usage: "ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]",
      description: "Returns all the elements in the sorted set at key with a score between min and max (including elements with score equal to min or max). The elements are considered to be ordered from low to high scores.",
      return_val: "Multi-bulk reply: list of elements in the specified score range (optionally with their scores).",
      patterns: ""
    },
    {
      name: "zrank",
      url: "http://redis.io/commands/zrank",
      usage: "ZRANK key member",
      description: "Returns the rank of member in the sorted set stored at key, with the scores ordered from low to high. The rank (or index) is 0-based, which means that the member with the lowest score has rank 0.",
      return_val: "If member exists in the sorted set, Integer reply: the rank of member.",
      patterns: ""
    },
    {
      name: "zrem",
      url: "http://redis.io/commands/zrem",
      usage: "ZREM key member [member ...]",
      description: "Removes the specified members from the sorted set stored at key. Non existing members are ignored.",
      return_val: "The number of members removed from the sorted set, not including non existing members.",
      patterns: ""
    },
    {
      name: "zremrangebyrank",
      url: "http://redis.io/commands/zremrangebyrank",
      usage: "ZREMRANGEBYRANK key start stop",
      description: "Removes all elements in the sorted set stored at key with rank between start and stop. Both start and stop are 0 -based indexes with 0 being the element with the lowest score. These indexes can be negative numbers, where they indicate offsets starting at the element with the highest score. For example: -1 is the element with the highest score, -2 the element with the second highest score and so forth.",
      return_val: "Integer reply: the number of elements removed.",
      patterns: ""
    },
    {
      name: "zremrangebyscore",
      url: "http://redis.io/commands/zremrangebyscore",
      usage: "ZREMRANGEBYSCORE key min max",
      description: "Removes all elements in the sorted set stored at key with a score between min and max (inclusive).",
      return_val: "Integer reply: the number of elements removed.",
      patterns: ""
    },
    {
      name: "zrevrange",
      url: "http://redis.io/commands/zrevrange",
      usage: "ZREVRANGE key start stop [WITHSCORES]",
      description: "Returns the specified range of elements in the sorted set stored at key. The elements are considered to be ordered from the highest to the lowest score. Descending lexicographical order is used for elements with equal score.",
      return_val: "Multi-bulk reply: list of elements in the specified range (optionally with their scores).",
      patterns: ""
    },
    {
      name: "zrevrangebyscore",
      url: "http://redis.io/commands/zrevrangebyscore",
      usage: "ZREVRANGEBYSCORE key max min [WITHSCORES] [LIMIT offset count]",
      description: "Returns all the elements in the sorted set at key with a score between max and min (including elements with score equal to max or min). In contrary to the default ordering of sorted sets, for this command the elements are considered to be ordered from high to low scores.",
      return_val: "Multi-bulk reply: list of elements in the specified score range (optionally with their scores).",
      patterns: ""
    },
    {
      name: "zrevrank",
      url: "http://redis.io/commands/zrevrank",
      usage: "ZREVRANK key member",
      description: "Returns the rank of member in the sorted set stored at key, with the scores ordered from high to low. The rank (or index) is 0-based, which means that the member with the highest score has rank 0.",
      return_val: "If member exists in the sorted set, Integer reply: the rank of member.",
      patterns: ""
    },
    {
      name: "zscore",
      url: "http://redis.io/commands/zscore",
      usage: "ZSCORE key member",
      description: "Returns the score of member in the sorted set at key.",
      return_val: "Bulk reply: the score of member (a double precision floating point number), represented as string.",
      patterns: ""
    },
    {
      name: "zunionstore",
      url: "http://redis.io/commands/zunionstore",
      usage: "ZUNIONSTORE destination numkeys key [key ...] [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]",
      description: "Computes the union of numkeys sorted sets given by the specified keys, and stores the result in destination. It is mandatory to provide the number of input keys (numkeys) before passing the input keys and the other (optional) arguments.",
      return_val: "Integer reply: the number of elements in the resulting sorted set at destination.",
      patterns: ""
    }
  ];

  $scope.advanced_commands = [
    {
      name: "auth",
      url: "http://redis.io/commands/auth",
      usage: "AUTH password",
      description: "Request for authentication in a password-protected Redis server. Redis can be instructed to require a password before allowing clients to execute commands. This is done using the requirepass directive in the configuration file.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "client-kill",
      url: "http://redis.io/commands/client-kill",
      usage: "CLIENT KILL ip:port",
      description: "The CLIENT KILL command closes a given client connection identified by ip:port.",
      return_val: "Status code reply: OK if the connection exists and has been closed",
      patterns: ""
    },
    {
      name: "client-list",
      url: "http://redis.io/commands/client-list",
      usage: "CLIENT LIST",
      description: "The CLIENT LIST command returns information and statistics about the client connections server in a mostly human readable format.",
      return_val: "Bulk reply: a unique string, formatted as follows:",
      patterns: ""
    },
    {
      name: "config-get",
      url: "http://redis.io/commands/config-get",
      usage: "CONFIG GET parameter",
      description: "The CONFIG GET command is used to read the configuration parameters of a running Redis server. Not all the configuration parameters are supported in Redis 2.4, while Redis 2.6 can read the whole configuration of a server using this command.",
      return_val: "The return type of the command is a Bulk reply.",
      patterns: ""
    },
    {
      name: "config-set",
      url: "http://redis.io/commands/config-set",
      usage: "CONFIG SET parameter value",
      description: "The CONFIG SET command is used in order to reconfigure the server at run time without the need to restart Redis. You can change both trivial parameters or switch from one to another persistence option using this command.",
      return_val: "Status code reply: OK when the configuration was set properly. Otherwise an error is returned.",
      patterns: ""
    },
    {
      name: "config-resetstat",
      url: "http://redis.io/commands/config-resetstat",
      usage: "CONFIG RESETSTAT",
      description: "Resets the statistics reported by Redis using the INFO command.",
      return_val: "Status code reply: always OK.",
      patterns: ""
    },
    {
      name: "debug-object",
      url: "http://redis.io/commands/debug-object",
      usage: "DEBUG OBJECT key",
      description: "DEBUG OBJECT is a debugging command that should not be used by clients. Check the OBJECT command instead.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "debug-segfault",
      url: "http://redis.io/commands/debug-segfault",
      usage: "DEBUG SEGFAULT",
      description: "DEBUG SEGFAULT performs an invalid memory access that crashes Redis. It is used to simulate bugs during the development.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "echo",
      url: "http://redis.io/commands/echo",
      usage: "ECHO message",
      description: "Returns message.",
      return_val: "Bulk reply",
      patterns: ""
    },
    {
      name: "eval",
      url: "http://redis.io/commands/eval",
      usage: "EVAL script numkeys key [key ...] arg [arg ...]",
      description: "EVAL and EVALSHA are used to evaluate scripts using the Lua interpreter built into Redis starting from version 2.6.0.",
      return_val: "",
      patterns: ""
    },
    {
      name: "evalsha",
      url: "http://redis.io/commands/evalsha",
      usage: "EVALSHA sha1 numkeys key [key ...] arg [arg ...]",
      description: "Evaluates a script cached on the server side by its SHA1 digest. Scripts are cached on the server side using the SCRIPT LOAD command. The command is otherwise identical to EVAL.",
      return_val: "",
      patterns: ""
    },
    {
      name: "info",
      url: "http://redis.io/commands/info",
      usage: "INFO",
      description: "The INFO command returns information and statistics about the server in a format that is simple to parse by computers and easy to read by humans.",
      return_val: "Bulk reply: as a collection of text lines.",
      patterns: ""
    },
    {
      name: "lastsave",
      url: "http://redis.io/commands/lastsave",
      usage: "LASTSAVE",
      description: "Return the UNIX TIME of the last DB save executed with success. A client may check if a BGSAVE command succeeded reading the LASTSAVE value, then issuing a BGSAVE command and checking at regular intervals every N seconds if LASTSAVE changed.",
      return_val: "Integer reply: an UNIX time stamp.",
      patterns: ""
    },
    {
      name: "migrate",
      url: "http://redis.io/commands/migrate",
      usage: "MIGRATE host port key destination-db timeout",
      description: "Atomically transfer a key from a source Redis instance to a destination Redis instance. On success the key is deleted from the original instance and is guaranteed to exist in the target instance.",
      return_val: "Status code reply: The command returns OK on success.",
      patterns: ""
    },
    {
      name: "monitor",
      url: "http://redis.io/commands/monitor",
      usage: "MONITOR",
      description: "MONITOR is a debugging command that streams back every command processed by the Redis server. It can help in understanding what is happening to the database. This command can both be used via redis-cli and via telnet.",
      return_val: "Non standard return value, just dumps the received commands in an infinite flow.",
      patterns: ""
    },
    {
      name: "ping",
      url: "http://redis.io/commands/ping",
      usage: "PING",
      description: "Returns PONG. This command is often used to test if a connection is still alive, or to measure latency",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "quit",
      url: "http://redis.io/commands/quit",
      usage: "QUIT",
      description: "Ask the server to close the connection. The connection is closed as soon as all pending replies have been written to the client.",
      return_val: "Status code reply: always OK.",
      patterns: ""
    },
    {
      name: "save",
      url: "http://redis.io/commands/save",
      usage: "SAVE",
      description: "The SAVE commands performs a synchronous save of the dataset producing a point in time snapshot of all the data inside the Redis instance, in the form of an RDB file.",
      return_val: "Status code reply: The commands returns OK on success.",
      patterns: ""
    },
    {
      name: "script-exists",
      url: "http://redis.io/commands/script-exists",
      usage: "SCRIPT EXISTS script [script ...]",
      description: "Returns information about the existence of the scripts in the script cache.",
      return_val: "Multi-bulk reply The command returns an array of integers that correspond to the specified SHA1 digest arguments. For every corresponding SHA1 digest of a script that actually exists in the script cache, an 1 is returned, otherwise 0 is returned.",
      patterns: ""
    },
    {
      name: "script-flush",
      url: "http://redis.io/commands/script-flush",
      usage: "SCRIPT FLUSH",
      description: "Flush the Lua scripts cache.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "script-kill",
      url: "http://redis.io/commands/script-kill",
      usage: "SCRIPT KILL",
      description: "Kills the currently executing Lua script, assuming no write operation was yet performed by the script.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "script-load",
      url: "http://redis.io/commands/script-load",
      usage: "SCRIPT LOAD script",
      description: "Load a script into the scripts cache, without executing it. After the specified command is loaded into the script cache it will be callable using EVALSHA with the correct SHA1 digest of the script, exactly like after the first successful invocation of EVAL.",
      return_val: "Bulk reply This command returns the SHA1 digest of the script added into the script cache.",
      patterns: ""
    },
    {
      name: "shutdown",
      url: "http://redis.io/commands/shutdown",
      usage: "SHUTDOWN [NOSAVE] [SAVE]",
      description: "The command behavior is the following: - Stop all the clients. - Perform a blocking SAVE if at least one save point is configured. - Flush the Append Only File if AOF is enabled. - Quit the server.",
      return_val: "Status code reply on error. On success nothing is returned since the server quits and the connection is closed.",
      patterns: ""
    },
    {
      name: "slaveof",
      url: "http://redis.io/commands/slaveof",
      usage: "SLAVEOF host port",
      description: "The SLAVEOF command can change the replication settings of a slave on the fly. If a Redis server is already acting as slave, the command SLAVEOF NO ONE will turn off the replication, turning the Redis server into a MASTER. In the proper form SLAVEOF hostname port will make the server a slave of another server listening at the specified hostname and port.",
      return_val: "Status code reply",
      patterns: ""
    },
    {
      name: "slowlog",
      url: "http://redis.io/commands/slowlog",
      usage: "SLOWLOG subcommand [argument]",
      description: "This command is used in order to read and reset the Redis slow queries log.",
      return_val: "",
      patterns: ""
    },
    {
      name: "time",
      url: "http://redis.io/commands/time",
      usage: "TIME",
      description: "The TIME command returns the current server time as a two items lists: a Unix timestamp and the amount of microseconds already elapsed in the current second. Basically the interface is very similar to the one of the gettimeofday system call.",
      return_val: "unix time in seconds. microseconds.",
      patterns: ""
    }
  ];


}

