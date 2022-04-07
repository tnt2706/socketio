const _ = require('lodash');
const { CONSTANCE: { SOCKETIO_EVENT: { TIMER }, ENUM } } = require('../../config');
const { authenticateStore: redis } = require('../redis/stores');

module.exports = socket => {
  socket.on('join-timer', async data => {
    const { type, date, status } = data;
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }

    if (!type || !date || !_.includes(ENUM.TIMER, type)) return;

    const room = `${type}:${socket.userId}`;
    socket.join(room);
    logger.info('socket.on join - room', room);

    const clientsRoom = [...io.sockets.adapter.rooms.get(room)];
    const timer = await redis.getAsync(room);
    const dataTimerUpdate = { date, duration: 0, status };
    if (clientsRoom.length === 1 && !timer) {
      await redis.setAsync(room, JSON.stringify(dataTimerUpdate));
    }
    if (timer) {
      const { date: startDate, status: oldStatus } = JSON.parse(timer);
      const duration = +(new Date(date)) - +(new Date(startDate));
      io.to(room).emit(TIMER.RECONNECT, { type, duration, status: oldStatus });
    }
  });

  socket.on('pause-timer', async data => {
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }
    const { type, date, status } = data;
    if (!type || !date || !_.includes(ENUM.TIMER, type)) return;

    const room = `${type}:${socket.userId}`;

    if (!socket.rooms.has(room)) return;

    const timer = await redis.getAsync(room);
    if (!timer) return;

    const { duration, date: startDate } = JSON.parse(timer);
    const newDuration = +(new Date(date)) - +(new Date(startDate)) + duration;
    const dataTimerUpdate = { date, duration: newDuration, status };
    await redis.setAsync(room, JSON.stringify(dataTimerUpdate));
    io.to(room).emit(TIMER.PAUSE, { ...dataTimerUpdate, type, duration: newDuration });
  });

  socket.on('continue-timer', async data => {
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }

    const { type, date, status } = data;
    if (!type || !date || !_.includes(ENUM.TIMER, type)) return;

    const room = `${type}:${socket.userId}`;
    if (!socket.rooms.has(room)) return;

    const timer = await redis.getAsync(room);
    if (!timer) return;

    const { duration, status: oldStatus } = JSON.parse(timer);

    if (oldStatus === 'pause') {
      const dataTimerUpdate = { date, duration, status };
      await redis.setAsync(room, JSON.stringify(dataTimerUpdate));
      io.to(room).emit(TIMER.CONTINUE, { ...dataTimerUpdate, type, duration });
    }
  });

  socket.on('leave-timer', async data => {
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }

    const { type, date, status } = data;
    if (!type || !date || !_.includes(ENUM.TIMER, type)) return;

    const room = `${type}:${socket.userId}`;
    if (!socket.rooms.has(room)) return;

    const timer = await redis.getAsync(room);
    if (!timer) return;

    const { duration, date: startDate, status: oldStatus } = JSON.parse(timer);
    const newDuration = oldStatus === 'pause' ? duration : +(new Date(date)) - +(new Date(startDate)) + duration;

    io.to(room).emit(TIMER.LEAVE, { duration: newDuration, type, status });
    await redis.delAsync(room);

    logger.info(`duration of the ${socket.userId} with ${room} : `, `${newDuration}(ms)`);

    socket.leave(room);
  });

  socket.on('disconnect', () => {
    logger.info(`socket.io: a client disconnect ${socket.id}`);
  });
};
