
require './lib/config'

argv        = process.argv.splice(2);
listen_port = parseInt(argv[0]) || config.LISTEN_PORT;

logger.info "RedisFuton start...", listen_port

new FutonServer().start(listen_port)