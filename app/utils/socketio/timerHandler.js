const { authenticateStore: redis } = require('../redis/stores');

module.exports = socket => {
  logger.info(`client connected : ${socket.id}`);
  socket.join('BiocareCardiac');

  socket.on('join-timesheet', async data => {
    const { room, date: startDate, status } = JSON.parse(data);
    if (room) {
      socket.join(room);
      const clientsRoom = [...io.sockets.adapter.rooms.get(room)];
      if (startDate && clientsRoom.length === 1) {
        const dataTimer = { startDate, duration: 0, status };
        await redis.setAsync(`timesheet:${room}`, JSON.stringify(dataTimer));
      }
    }
  });

  socket.on('pause-timesheet', async data => {
    const { room, date, status } = JSON.parse(data);
    if (room && date) {
      const { duration: durationOld, startDate: currentStartDate } = JSON.parse(await redis.getAsync(`timesheet:${room}`));
      const stopDate = new Date(date);
      const startDate = new Date(currentStartDate);
      const duration = Math.round((+stopDate - +startDate) / 1000) + parseInt(durationOld, 10);
      const dataTimer = { startDate: date, duration, status };
      await redis.setAsync(`timesheet:${room}`, JSON.stringify(dataTimer));
      io.to(room).emit(`timesheet::${room}`, duration);
    }
  });

  socket.on('start-timesheet', async data => {
    const { room, date, status } = JSON.parse(data);
    if (room && date) {
      const { duration } = JSON.parse(await redis.getAsync(`timesheet:${room}`));
      const dataTimer = { startDate: date, duration, status };
      await redis.setAsync(`timesheet:${room}`, JSON.stringify(dataTimer));
      io.to(room).emit(`timesheet::${room}`, duration);
    }
  });

  socket.on('leave-timesheet', async data => {
    const { room, date } = JSON.parse(data);
    if (date) {
      const { duration: durationOld, startDate: currentStartDate, status } = JSON.parse(await redis.getAsync(`timesheet:${room}`));
      const stopDate = new Date(date);
      const startDate = new Date(currentStartDate);
      let duration = 0;
      if (status === 'pause') {
        duration = parseInt(durationOld, 10);
      } else {
        duration = Math.round((+stopDate - +startDate) / 1000) + parseInt(durationOld, 10);
      }

      io.to(room).emit(`timesheet-log:${room}`, duration);
      await redis.delAsync(`timesheet:${room}`);
    }
    socket.leave(room);
  });

  socket.on('disconnect', () => {
    logger.info(`client disconnect : ${socket.id}`);
  });
};
