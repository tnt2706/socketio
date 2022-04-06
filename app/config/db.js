module.exports = {
  // redis
  redisDbs: {
    authDb: {
      port: 6379,
      host: process.env.REDIS_URL || 'localhost',
      auth_pass: process.env.SKIP_TLS ? undefined : process.env.REDIS_AUTH,
      db: parseInt('0', 10),
      // get tls() {
      //   return (process.env.NODE_ENV === 'test' || process.env.SKIP_TLS) ? undefined : { servername: this.host };
      // },
    },
    socketioDb: {
      port: 6379,
      host: process.env.REDIS_URL || 'localhost',
      auth_pass: process.env.SKIP_TLS ? undefined : process.env.REDIS_AUTH,
      // get tls() {
      //   return (process.env.NODE_ENV === 'test' || process.env.SKIP_TLS) ? undefined : { servername: this.host };
      // },
    },
  },
};
