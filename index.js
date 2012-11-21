
require('./lib/lib/config');

var argv        = process.argv.splice(2);
var listen_port = parseInt(argv[0]) || 5985;

logger.info("RedisFuton start", listen_port);
new FutonServer().start(listen_port);