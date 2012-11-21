
redis = require("redis")

class RedisInterface
  constructor: (@host='localhost',@port=6379) ->
    @client = redis.createClient(@port, @host)
    @client.on "error", (err) ->
      logger.error("Redis Error", err)
    
  info: (callback) ->
    @client.info (err, resp) ->
      return callback(err) if err
      return callback(new Error("Undefined")) unless resp
      lines = resp.trim().split("\n")
      redis_info = _.map(lines, (val) ->
        kv = val.split(":")
        {key: kv[0], value: kv[1]?.trim()}
      ) 
      callback(err, redis_info)
  
  select: (db, callback) ->
    @client.select db, callback

  database: () ->
    @client.selected_db || 0
  
  
  get_keys: (filter="*", callback) ->
    logger.info "get_keys", filter 
    client = @client
    client.send_command "keys", [filter], (err, keys) ->
      return callback(err) if err 
      logger.info "keys", keys.length
      return callback(err, keys) if keys.length is 0
      Step(
        () ->
          for key in keys
            client.send_command "type", [key], @parallel()
          return
        , (err2, values...) ->
          # logger.info "values", values
          keys_with_types = _.map(_.zip(keys, values), (kv) ->
            {key: kv[0], type: kv[1]}
          )
          callback(err, keys_with_types)
          return
      )

    
    
    
    
  
  
  get: (key, callback) ->
    @client.get key, callback


  set: (key, value, callback) ->
    @client.set key, value, callback
  

  send_command: (command, args, callback) ->
    @client.send_command command, args, callback
  
    
  
  
  

module.exports = RedisInterface
