RedisInterface = require './redis_interface'

class MainController
  constructor: () ->
    @redis = new RedisInterface()
  
  
  info: (req, res) -> 
    @redis.info (err, resp) ->
      res.json {
        app: "Redis Futon", 
        version: "0.0.1",
        server_info: resp
      }


module.exports = MainController

