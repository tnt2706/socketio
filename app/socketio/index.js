const { authenticateStore: redis } = require('../utils/redis/stores');

io.on('connection', socket => {
  logger.info(`client connected : ${socket.id}`);
  socket.join('BiocareCardiac');

  socket.on('join-timesheet', async (data, res) => {
    const { room, date: startDate } = JSON.parse(data);
      socket.startDate = new Date();
      if (room) {
        socket.join(room);
        const clientsRoom = [...io.sockets.adapter.rooms.get(room)];
        if (startDate && clientsRoom.length === 1) {
          await redis.setAsync(`timesheet:${room}`, startDate);
        }
    }
  });

  socket.on('disconnect', () => {
    logger.info(`client disconnect : ${socket.id}`);
  });

  socket.on('leave-timesheet',async (data) => {
    const { room, date } = JSON.parse(data);
    if(date){
      const startDate = new Date(await redis.getAsync(`timesheet:${room}`))
      await redis.delAsync(`timesheet:${room}`)
      const endDate = new Date(date)
      const duration =Math.round((+endDate - +startDate)/1000);
      console.log(duration)
      io.to(room).emit('eventName', duration);
    }


    socket.leave(room);
  });
});
