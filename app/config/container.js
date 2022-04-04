module.exports = {
  NODE_ENV: process.env.NODE_ENV,
  hostName: process.env.HOSTNAME || 'socketio-server',
  socketioPort: parseInt(process.env.PORT || '8080', 10),
};
