
require './lib/config'

logger.info "RedisFuton start..."

new FutonServer().start()