require("dotenv/config");

const express = require('express');
const https = require('https');
const fs = require('fs');
const {paymentRequest} = require("express-payment-request");
const {encode: btoa} = require("base-64");

const {
  MERCHANT_ID_P12_PATH,
  MERCHANT_ID,
  DOMAIN_NAME,
  PASSPHRASE,
  PORT,
} = process.env;

const pfx = fs.readFileSync(MERCHANT_ID_P12_PATH);
const passphrase = PASSPHRASE;

const app = express()
  .use(paymentRequest(
    { 
      merchantInfo: {
        merchantIdentifier: MERCHANT_ID,
        domainName: DOMAIN_NAME,
        displayName: "MyStore",
      },
      https: { pfx, passphrase },
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

// XXX: To load a https server (compatible to permit experimentation with Safari),
//      you can allocate a set of test credentials using https://github.com/fraigo/https-localhost-ssl-certificate
https.createServer({ key: fs.readFileSync('./https/server.key'), cert: fs.readFileSync('./https/server.crt') }, app)
  .listen(parseInt(PORT), () => null);

app.listen(parseInt(PORT) + 1, () => null);

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

// XXX: Prints example call formats to define payments. (Each charge $0.01, http/https).
console.log(`http://localhost:3001/payment?details=${btoa(JSON.stringify(details))}`);
console.log(`https://localhost:3000/payment?details=${btoa(JSON.stringify(details))}`);
