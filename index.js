
require('./lib/lib/config');

var argv        = process.argv.splice(2);
var listen_port = parseInt(argv[0]) || 5985;
var redis_port  = parseInt(argv[1]) || 6379;

logger.info("RedisFuton start", listen_port);
new FutonServer(redis_port).start(listen_port);
