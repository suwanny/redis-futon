
redis = require("redis")

class RedisInterface
  constructor: (@host='localhost',@port=6379) ->
    @client = redis.createClient(@port, @host)
    @client.on "error", (err) ->
      logger.error("Redis Error", err)
    
  info: (callback) ->
    @client.info (err, resp) ->
      return callback(err) if err 
      lines = resp.split("\n")
      lines = resp.trim().split("\n")
      redis_info = _.map(lines, (val) ->
        kv = val.split(":")
        {key: kv[0], value: kv[1].trim()}
      ) 
      callback(err, redis_info)
    

module.exports = RedisInterface
