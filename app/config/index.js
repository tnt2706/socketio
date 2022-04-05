const container = require('./container');
const db = require('./db');

const config = {
  ...container,
  ...db,
};

module.exports = config;
