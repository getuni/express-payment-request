const express = require("express");
const {paymentRequest} = require("express-payment-request");

express()
  .use(paymentRequest())
  .listen(3000, () => console.log("Running!"));
