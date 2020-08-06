import "@babel/polyfill";

import React from "react";
import {hydrate} from "react-dom";

import App from "./App";

hydrate(
  <App
    isServerSide={false}
    details={{
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
    }}
    methodData={[
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
    ]}
  />,
  document.getElementById("container"),
);
