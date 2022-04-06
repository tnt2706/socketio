const container = require('./container');
const db = require('./db');
const constant = require('./constant');

const config = {
  ...container,
  ...db,
  ...constant
};

module.exports = config;
