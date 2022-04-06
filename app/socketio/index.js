const { timerHandler } = require('../utils/socketio');

const onConnection = socket => {
  socket.userId = 'userId_12345';
  socket.isVerified = true;

  logger.info(`socket.io: a client connected ${socket.id}`);

  timerHandler(socket);
};

io.on('connection', onConnection);
