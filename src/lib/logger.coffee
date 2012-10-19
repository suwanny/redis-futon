

util    = require 'util'
winston = require 'winston'

class Logger
  constructor: (name, @log_level="info") ->
    ConsoleTransport = new (winston.transports.Console)(
      colorize: 'true', 
      level: config.LOG_LEVEL
    )

    FileTransport = new (winston.transports.File)(
      filename: "#{name}.log"
    )

    @logger = new (winston.Logger)(
      transports: [ConsoleTransport]
    )


  get_timestr: ->
    now = new Date();
    timestr = now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate()
    timestr += " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds()
    timestr += "." + now.getMilliseconds()
    timestr

  info: (msg, obj) ->
    msg += ": " + util.inspect(obj) if obj?
    @logger.info " " + @get_timestr() + "\t" + msg

  error: (msg, obj) ->
    msg += ": " + util.inspect(obj) if obj?
    @logger.error @get_timestr() + "\t" + msg

  debug: (msg, obj) ->
    return unless @log_level is 'debug'
    msg += ": " + util.inspect(obj) if obj?
    @logger.debug @get_timestr() + "\t" + msg

  etrace: (err) -> @error err.stack

  



module.exports = Logger


