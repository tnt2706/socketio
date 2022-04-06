const { timerHandler } = require('../utils/socketio');

const onConnection = socket => {
  timerHandler(socket);
};

io.on('connection', onConnection);
