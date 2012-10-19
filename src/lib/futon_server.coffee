

express         = require 'express'
querystring     = require 'querystring'
MainController  = require('./main_controller')

class FutonServer
  constructor: () ->
    @app = express.createServer()
    @main_controller = new MainController()
    @configure(@app)

  configure: (app) ->
    app.configure () ->
      app.use(express.methodOverride())
      app.use(app.router)
      app.use(express.static(__dirname + '/../../www/public'))
      app.use(express.errorHandler({ dumpExceptions: true, showStack: true }))
      app.set("view options", {layout: false});
      app.set('views', __dirname + '/../../www/views')
      app.set('view engine', 'ejs')
      return

    # routes
    app.get '/info',   @process('info', @main_controller)

    return
  

  start: () ->
    @app.listen config.LISTEN_PORT
    logger.info "Server is listening to #{config.LISTEN_PORT}"


  process: (path, handler) -> 
    (req, res) =>
      try
        fn_handler = (req, res) => handler[path] req, res
        @parse_post_body req, res, fn_handler
      catch err
        logger.error "process Error", err
        res.json {error: true, reason: 'express error', message: err.message }


  parse_post_body: (req, res, callback) ->
    if req.method is 'POST'
      body_buffer = ''
      req.on 'data', (data) -> 
        body_buffer += data

      req.on 'end', () ->
        content_type = req.headers['content-type']
        logger.debug  "[Server] Content-Type: #{content_type}"
        try
          req.body = switch content_type
            when "application/json", "json" then JSON.parse(body_buffer)
            when "application/x-www-form-urlencoded" then querystring.parse(body_buffer)
            else body_buffer
          callback(req, res)
        catch err
          logger.error "[Server] parse_post_body", err
          if err.type is 'unexpected_token'
            logger.error "[Server] Illegal JSON String", body_buffer
          throw err
    else
      callback(req, res)


  

module.exports = FutonServer

