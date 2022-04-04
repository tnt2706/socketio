require('./global');

const { startSocketioServer, stopSocketioServer } = require('./app/socketio');

function shutdown() {
  setTimeout(() => {
    stopSocketioServer()
      .then(() => {
        process.exit();
      });
  }, 10000);
}

process.on('uncaughtException', exception => {
  logger.warn(exception);
});

process.on('unhandledRejection', reason => {
  logger.warn(reason.stack || reason);
});

process.on('SIGINT', () => {
  logger.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown');
  shutdown();
});

process.on('SIGTERM', () => {
  logger.info('Got SIGTERM (docker container stop). Graceful shutdown');
  shutdown();
});

startSocketioServer();
