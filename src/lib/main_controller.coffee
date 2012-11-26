RedisInterface = require './redis_interface'

class MainController
  constructor: () ->
    @redis = new RedisInterface()
    @routes = [
        {path: "/redis/info",           http_method: "get",   method: "redis_info" }
      , {path: "/redis/select/:db",     http_method: "get",   method: "redis_select" }
      , {path: "/redis/database",       http_method: "get",   method: "redis_database" }
      , {path: "/redis/keys/:_filter",  http_method: "get",   method: "redis_keys" }
      , {path: "/redis/keys",           http_method: "get",   method: "redis_keys" }
      , {path: "/redis/get/:key",       http_method: "get",   method: "redis_get" }
      , {path: "/redis/set",            http_method: "post",  method: "redis_set" }
      , {path: "/redis/command",        http_method: "post",  method: "redis_command" }
      , {path: "/redis/list/:key",      http_method: "get",   method: "redis_get_list" }
      , {path: "/redis/hash/:key",      http_method: "get",   method: "redis_get_hash" }
      , {path: "/redis/set/:key",       http_method: "get",   method: "redis_get_set" }
      , {path: "/redis/zset/:key",      http_method: "get",   method: "redis_get_zset" }
    ]
    return
  
  redis_info: (req, res) -> 
    @redis.info (err, data) -> res.json(data)

  redis_select: (req, res) ->
    logger.info "redis_select", req.params
    db = req.params.db
    @redis.select db, (err, data) ->
      res.json {err: err, resp: data}

  redis_database: (req, res) ->
    logger.info "redis_database", @redis.database()
    res.json({database: @redis.database()})

  redis_keys: (req, res) ->
    filter = req.params._filter || "*"
    redis = @redis
    @redis.get_keys filter, (err, data) ->
      res.json {err: err, database: redis.database(), keys: data}
    
    
  redis_get: (req, res) ->
    key = req.params.key
    @redis.get key, (err, data) ->
      res.json {err: err, resp: data}
    

  redis_set: (req, res) ->
    @redis.set req.body.key, req.body.value, (err, data) ->
      res.json {err: err, resp: data}
  
  
  redis_command: (req, res) ->
    logger.info "redis_command", req.body
    @redis.send_command req.body.command, req.body.args, (err, data) ->
      res.json {err: err, resp: data}
  
  redis_get_list: (req, res) ->
    key = req.params.key
    @redis.client.lrange [key, 0, -1], (err, data) ->
      if err
        res.json []
      else
        res.json data

  redis_get_set: (req, res) ->
    key = req.params.key
    @redis.client.smembers [key], (err, data) ->
      if err
        res.json []
      else
        res.json data
  
  
  redis_get_hash: (req, res) ->
    key = req.params.key
    @redis.client.hgetall [key], (err, data) ->
      if err
        res.json {}
      else
        res.json data
  
  redis_get_zset: (req, res) ->
    key = req.params.key
    @redis.client.zrangebyscore [key, "-inf", "+inf", "WITHSCORES"], (err, data) ->
      if err
        res.json []
      else
        list_by_score = []
        for val, i in data by 2
          list_by_score.push({index: i/2, value: val, score: data[i+1]})
        res.json list_by_score
  
  
  
  
  
  
  
  
  


module.exports = MainController

