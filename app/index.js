require('./global');
const http = require('http');
const socketServer = require('socket.io');
const redisAdapter = require('socket.io-redis');
const app = require('./app');
const config = require('./config');

const server = http.createServer(app);

server.listen(config.socketioPort, '0.0.0.0', () => {
  logger.info(`🚀 Running on port http://localhost:${config.socketioPort}`);
});

const adapter = redisAdapter({ ...config.redisDbs.socketioDb, key: 'cardiac-socket.io-server' });
const io = socketServer(server, { pingTimeout: 10000 });
global.io = io;
io.adapter(adapter);

require('./socketio');

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

function shutdown() {
  server.close().then(() => {
    stopSocketioServer().then(() => {
      process.exit();
    });
  });
}

function stopSocketioServer() {
  return new Promise((resolve, reject) => {
    io.close(error => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}
