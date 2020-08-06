import "@babel/polyfill";

import React from "react";
import {hydrate} from "react-dom";

import App from "./App";

const { details, methodData } = window.__REACT_APP_CONFIG__;

hydrate(
  <App
    isServerSide={false}
    details={details}
    methodData={methodData}
  />,
  document.getElementById("container"),
);
