
redis = require("redis")

class RedisInterface
  constructor: (@host='localhost',@port=6379) ->
    @client = redis.createClient(@port, @host)
    @client.on "error", (err) ->
      logger.error("Redis Error", err)
    
  info: (callback) ->
    @client.info (err, resp) ->
      callback(err, resp)
    
    
  
  
  
  

module.exports = RedisInterface
