import "@babel/polyfill";

import * as React from "react";
import express from "express";
import {OK} from "http-status-codes";
import appRootPath from "app-root-path";
import {renderToString} from "react-dom/server";
import {compile} from "handlebars";
import {decode as atob} from "base-64";
import axios from "axios";
import https from "https";

import App from "./app/App";

const validate = ({ merchantInfo, https: { ...extras } }) => (req, res, next) => Promise
  .resolve()
  .then(
    () => {
      const {query} = req;
      const {url: validationUrl} = query;
      const url = atob(validationUrl);
      return axios(
        {
          url,
          method: "post",
          data: merchantInfo,
          httpsAgent: new https.Agent({...extras}),
        },
      );
    },
  )
  .then(({data}) => res.status(OK).json(data))
  .catch(next);

const app = ({path, methodData}) => (req, res, next) => Promise
  .resolve()
  .then(
    () => {
      const {query} = req;
      const {details} = query;
      // TODO: Host and Path are looking like the same thing.
      const host = `https://${req.get("host")}`;
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
        path: "${path}",
        host: "${host}",
        methodData: ${JSON.stringify(methodData)},
        details: ${atob(details)}, 
      };
    </script>
  </head>
  <body>
    <div id="container"></div>
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
  const {https, merchantInfo, ...opts} = {...defaultOptions, ...options};
  const {path} = opts;
  return express()
    .get(`${path}/app.js`, (_, res) => res.status(OK).sendFile(appRootPath + '/node_modules/express-payment-request/dist/app.js'))
    .get(`${path}/vendor.js`, (_, res) => res.status(OK).sendFile(appRootPath + '/node_modules/express-payment-request/dist/vendor.js'))
    .get(`${path}/validate`, validate({ https, merchantInfo }))
    .get(path, app(opts));
};
