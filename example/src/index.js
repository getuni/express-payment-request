const express = require('express');
const https = require('https');
const fs = require('fs');
const {paymentRequest} = require("express-payment-request");

const port = 3000;

const key = fs.readFileSync('./certs/server.key');
const cert = fs.readFileSync('./certs/server.crt');
const options = { key, cert };

const app = express()
  .use(paymentRequest(
    { 
      methodData: [
        {
          supportedMethods: ['basic-card'],
          data: {
            supportedNetworks: ['visa', 'mastercard', 'diners'],
          },
        },
        {
          supportedMethods: ['https://android.com/pay'],
          data: {
            merchantId: 'fake',
            environment: 'TEST',
            allowedCardNetwork: ['AMEX', 'MASTERCARD', 'VISA', 'DISCOVER'],
            paymentMethodTokenizationParameters: {
              tokenizationType: 'GATEWAY_TOKEN',
              parameters: {
                gateway: 'stripe',
                "stripe:publishableKey": 'fake',
                "stripe:version": '2016-07-06'
              },
            },
          },
        },
        {
          supportedMethods: 'https://apple.com/apple-pay',
          data: {
            version: 3,
            merchantIdentifier: 'merchant.com.example',
            merchantCapabilities: ['supportsDebit'],
            supportedNetworks: ['masterCard', 'visa'],
            countryCode: 'US',
          },
        },
      ],
    }
  ));

https.createServer(options, app)
  .listen(port, () => null);

app.listen(port + 1, () => null);
