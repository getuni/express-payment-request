import "@babel/polyfill";

import React from "react";
import {hydrate} from "react-dom";

import App from "./App";

hydrate(
  <App
    isServerSide={false}
    {...window.__REACT_APP_CONFIG__}
  />,
  document.getElementById("container"),
);
