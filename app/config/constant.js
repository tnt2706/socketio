const _SOCKETIO_EVENT = {
  TIMER: {
    RECONNECT:'TimerReconnect',
    PAUSE: 'TimerPause',
    CONTINUE: 'TimerContinue',
    LEAVE: 'TimerLeave',
  },
};

module.exports = {
  CONSTANCE: {
    get SOCKETIO_EVENT() {
      return _SOCKETIO_EVENT;
    },
  },
};
