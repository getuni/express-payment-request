import "@babel/polyfill";

import * as React from "react";
import express from "express";
import {OK} from "http-status-codes";
import appRootPath from "app-root-path";
import {renderToString} from "react-dom/server";
import {compile} from "handlebars";

import App from "./app/App";

const app = ({path}) => (req, res, next) => Promise
  .resolve()
  .then(
    () => {
      // XXX: react-payment-request-api causes conflicts with SSR.
      //{container: renderToString(<App isServerSide />)}
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Payment</title>
    <style>
      body { margin:0; }
    </style>
    <script type="text/javascript">
      window.__REACT_APP_CONFIG__ = {
        details: {
          displayItems: [{
            label: 'Original donation amount',
            amount: { currency: 'USD', value: '65.00' },
          }, {
            label: 'Friends and family discount',
            amount: { currency: 'USD', value: '-10.00' },
          }, {
            label: 'Delivery tax',
            pending: true,
            amount: { currency: 'USD', value: '10.00' },
          }],
          total: {
            label: 'Total due',
            amount: { currency: 'USD', value : '55.00' },
          },
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
      };
    </script>
  </head>
  <body>
    <div id="container"></div>
    <!--<div id="container">{{{container}}}</div>-->
    <script src="${path}/app.js" charset="utf-8"></script>
    <script src="${path}/vendor.js" charset="utf-8"></script>
  </body>
</html>
      `.trim();
      return res.status(OK).send(compile(html)({}));
    },
  )
  .catch(next);

const defaultOptions = {
  path: "/payment",
};

export const paymentRequest = (options = defaultOptions) => {
  const {...opts} = {...defaultOptions, ...options};
  const {path} = opts;
  return express()
    .get(`${path}/app.js`, (_, res) => res.status(OK).sendFile(appRootPath + '/node_modules/express-payment-request/dist/app.js'))
    .get(`${path}/vendor.js`, (_, res) => res.status(OK).sendFile(appRootPath + '/node_modules/express-payment-request/dist/vendor.js'))
    .get(path, app(opts));
};
