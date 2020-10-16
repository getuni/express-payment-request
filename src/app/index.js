!window.Buffer && window.Buffer = require("buffer");

import "@babel/polyfill";

import React from "react";
import {hydrate} from "react-dom";
import PostMessageStream from "post-message-stream";

import App from "./App";

const postMessageStream = new PostMessageStream({
  name: "express-payment-request@provider",
  target: "express-payment-request@consumer",
});

hydrate(
  <App
    isServerSide={false}
    postMessageStream={postMessageStream}
    {...window.__REACT_APP_CONFIG__}
  />,
  document.getElementById("container"),
);
