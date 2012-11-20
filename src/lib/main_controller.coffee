RedisInterface = require './redis_interface'

class MainController
  constructor: () ->
    @redis = new RedisInterface()
    @routes = [
      {path: "/redis/info", http_method: "get", method: "redis_info" }
    ]
    return
  
  redis_info: (req, res) -> 
    @redis.info (err, resp) -> res.json(resp)


module.exports = MainController

