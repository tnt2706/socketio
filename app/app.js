const express = require('express');

const app = express();

app.get('/healthcheck', (req, res) => res.end('OK'));

app.get('/', (req, res) => res.sendFile(`${__dirname}/utils/public/views/index.html`));

module.exports = app;
