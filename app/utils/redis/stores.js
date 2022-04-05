const redis = require('redis');
const bluebird = require('bluebird');

const config = require('../../config');
const healthcheck = require('../healthcheck');

bluebird.promisifyAll(redis.RedisClient.prototype);

console.log(config.redisDbs.authDb.tls)

const authenticateStore = redis.createClient(config.redisDbs.authDb);

authenticateStore.on('connect', () => {
  console.log('Go hearer')
})

authenticateStore.on('error', (err) => {
  console.log(err)
  healthcheck.status.redis = false;
});



module.exports = {
  authenticateStore,
};
