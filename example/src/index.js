const express = require('express');
const https = require('https');
const fs = require('fs');
const {paymentRequest} = require("express-payment-request");
const {encode: btoa} = require("base-64");

const port = 3000;

const pfx = fs.readFileSync("./certs/merchant_id.p12");
const passphrase = "your passphrase";

console.log(pfx);

const app = express()
  .use(paymentRequest(
    { 
      https: {
        pfx,
        passphrase,
      },
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

https.createServer({ key: fs.readFileSync('./https/server.key'), cert: fs.readFileSync('./https/server.crt') }, app)
  .listen(port, () => null);

app.listen(port + 1, () => null);


const details = {
  displayItems: [
    {
      label: 'A really not scary amount. :)',
      amount: { currency: 'USD', value: '0.01' },
    }, 
  ],
  total: {
    label: 'Total due',
    amount: { currency: 'USD', value : '0.01' },
  },
};

console.log(`http://localhost:3001/payment?details=${btoa(JSON.stringify(details))}`);
console.log(`https://localhost:3000/payment?details=${btoa(JSON.stringify(details))}`);

