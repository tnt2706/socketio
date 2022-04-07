const _SOCKETIO_EVENT = {
  TIMER: {
    RECONNECT: 'TimerReconnect',
    PAUSE: 'TimerPause',
    CONTINUE: 'TimerContinue',
    LEAVE: 'TimerLeave',
  },
};

const _ENUM = {
  TIMER: ['timesheet'],
};

module.exports = {
  CONSTANCE: {
    get SOCKETIO_EVENT() {
      return _SOCKETIO_EVENT;
    },
    get ENUM() {
      return _ENUM;
    },
  },
};
