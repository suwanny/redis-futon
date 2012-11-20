

# Configuration

global.config = {
  LOG_LEVEL: "info",
  LISTEN_PORT: 5985
}

global._            = require 'underscore'
global.async        = require 'async'
global.Step         = require 'step'
global.FutonServer  = require './futon_server'
global.logger       = new (require './logger')("redis_futon")



# Extend JS String
unless String.prototype.chomp?
  String.prototype.chomp = () -> this.replace(/(\n|\r)+$/,'')

unless String.prototype.strip?
  String.prototype.strip = String.prototype.trim

unless String.prototype.contains?
  String.prototype.contains = (partial) ->
    this.indexOf(partial) isnt -1

    