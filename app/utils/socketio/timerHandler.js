const { CONSTANCE: { SOCKETIO_EVENT: { TIMER } } } = require('../../config');
const { authenticateStore: redis } = require('../redis/stores');

module.exports = socket => {
  socket.on('join-timer', async data => {
    const { type, date, status } = data;
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }
    if (type && date) {
      const room = `${type}:${socket.userId}`;
      socket.join(room);
      logger.info('socket.on join - room', room);
      const clientsRoom = [...io.sockets.adapter.rooms.get(room)];
      const dataTimer = await redis.getAsync(room);

      const dataTimerUpdate = { date, duration: 0, status };
      if (clientsRoom.length === 1 && !dataTimer) {
        await redis.setAsync(room, JSON.stringify(dataTimerUpdate));
      }
      if (dataTimer) {
        const { date: startDateTimer, status: oldStatus } = JSON.parse(dataTimer);
        const dateConnectAgain = new Date(date);
        const startDate = new Date(startDateTimer);
        const duration = ((+dateConnectAgain - +startDate) / 1000).toFixed(0);
        io.to(room).emit(TIMER.RECONNECT, { type, duration, status: oldStatus });
      }
    }
  });

  socket.on('pause-timer', async data => {
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }

    const { type, date, status } = data;
    const room = `${type}:${socket.userId}`;

    if (!socket.rooms.has(room)) return;

    if (type && date) {
      const dataTimer = await redis.getAsync(room);
      if (!dataTimer) return;

      const { duration, date: currentStartDate } = JSON.parse(dataTimer);
      const startDate = new Date(currentStartDate);
      const stopDate = new Date(date);
      const newDuration = (+stopDate - +startDate) + duration;
      const dataTimerUpdate = { date, duration: newDuration, status };
      await redis.setAsync(room, JSON.stringify(dataTimerUpdate));
      io.to(room).emit(TIMER.PAUSE, { ...dataTimerUpdate, type, duration: (newDuration / 1000).toFixed(0) });
    }
  });

  socket.on('continue-timer', async data => {
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }

    const { type, date, status } = data;
    const room = `${type}:${socket.userId}`;

    if (!socket.rooms.has(room)) return;

    const dataTimer = await redis.getAsync(room);
    if (!dataTimer) return;

    const { duration, status: oldStatus } = JSON.parse(dataTimer);

    if (type && date && oldStatus === 'pause') {
      const dataTimerUpdate = { date, duration, status };
      await redis.setAsync(room, JSON.stringify(dataTimerUpdate));
      io.to(room).emit(TIMER.CONTINUE, { ...dataTimerUpdate, type, duration: (duration / 1000).toFixed(0) });
    }
  });

  socket.on('leave-timer', async data => {
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }

    const { type, date, status } = data;
    const room = `${type}:${socket.userId}`;

    if (!socket.rooms.has(room)) return;

    if (date) {
      const dataTimer = await redis.getAsync(room);
      if (!dataTimer) return;

      const { duration, date: currentStartDate, status: oldStatus } = JSON.parse(dataTimer);
      const startDate = new Date(currentStartDate);
      const stopDate = new Date(date);
      let newDuration = 0;

      if (oldStatus === 'pause') {
        newDuration = (duration / 1000).toFixed(0);
      } else {
        newDuration = (((+stopDate - +startDate) + duration) / 1000).toFixed(0);
      }

      io.to(room).emit(TIMER.LEAVE, { duration: newDuration, type, status });
      await redis.delAsync(room);

      logger.info(`duration of the ${socket.userId} with ${room} : `, `${newDuration}(s)`);
    }
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    logger.info(`socket.io: a client disconnect ${socket.id}`);
  });
};
