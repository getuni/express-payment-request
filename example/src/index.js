const express = require('express');
const https = require('https');
const fs = require('fs');
const {paymentRequest} = require("express-payment-request");

const port = 3000;

const key = fs.readFileSync('./certs/server.key');
const cert = fs.readFileSync('./certs/server.crt');
const options = { key, cert };

const app = express()
  .use(paymentRequest());

https.createServer(options, app)
  .listen(port, () => null);
