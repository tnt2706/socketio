const _ = require('lodash');
const http = require('http');
const socketServer = require('socket.io');

const config = require('../config');

const server = http.createServer((req, res) => {
  if (req.url === '/healthcheck' && req.method === 'GET') {
    res.statusCode = 200;
    res.end('OK');
  }
});

const io = socketServer(server, { pingTimeout: 10000 });
global.io = io;;

io.on('connection', socket => {
  logger.info('socket.io: a client connected');
  socket.join('BiocareCardiac');
  socket.on('hello', async (token, res) => {
    logger.debug('### socket.io: hello', token);
    logger.debug('socket.io: a client hello', token);
    // const { isSuccess, message, signature } = await verifyToken(token);

    // if (!isSuccess) {
    //   logger.info('verifyToken failed', message);
    //   res('KICK');
    //   socket.disconnect(true);
    //   return;
    // }

    // socket.isVerified = true;
    // socket.cognitoId = signature.cognitoId;
    // socket.userId = signature.id;
    // socket.roles = signature.roles;
    // socket.facilityIds = signature.facilityIds;
    // logger.debug('socket.on hello - signature', signature);
    res('OK');
  });

  // socket.on('disconnect', (reason) => {
  //   handleSocketDisconnected(socket, reason);
  // });

  socket.on('join', (room, res) => {
    logger.debug('### socket.io: join');
    logger.debug('socket.on join - room', room);
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }
    const { userId, roles, facilityIds } = socket;
    const facilityRoles = ['Clinic Physician', 'Clinic Technician', 'Facility Admin'];
    logger.debug('socket.on hello - socket', { userId, roles, facilityIds });
    if (!room) return;
    if (room === userId) {
      socket.join(room);
      res('OK');
      return;
    }
    if (_.includes(facilityIds, room) && _.intersection(facilityRoles, roles).length) {
      socket.join(room);
      res('OK');
      return;
    }
    res('FAILED');
  });

  socket.on('leave', room => {
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }

    socket.leave(room);
  });
});

function startSocketioServer() {
  server.listen(config.socketioPort);
  logger.info(`🚀 Socketio server running on port: http://localhost:${config.socketioPort}`);
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

module.exports = {
  startSocketioServer,
  stopSocketioServer,
};
