io.on('connection', socket => {
  logger.info('socket.io: a client connected');
  socket.join('BiocareCardiac');

  socket.on('join', (room, res) => {
    socket.join(room);
    const clients = io.sockets.adapter.rooms.get(room);
  });

  socket.on('leave', room => {
    if (!socket.isVerified) {
      socket.disconnect(true);
      return;
    }

    socket.leave(room);
  });
});
