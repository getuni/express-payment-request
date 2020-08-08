import React, {useEffect, useCallback, useState} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {encode as btoa} from "base-64";

// XXX: Obviously this is super apple-pay specific, but we can extend this in future.
const App = ({isServerSide, methodData, details, options, path, host, postMessageStream, ...extraProps}) => {

  const requestPayment = useCallback(
    () => {
      if (!window.PaymentRequest) {
        return Promise.reject(new Error(`Payment Requests are not supported on this browser.`));
      }

      const request = new PaymentRequest(methodData, details, options);
      request.onmerchantvalidation = (event) => {
        const {validationURL: url} = event;
        return event
          .complete(
            axios({ url: `${host}${path}/validate?url=${btoa(url)}`, method: 'get' })
              .then(({data}) => data),
            false,
          );
      };

      return request.show()
        .then(response => response.complete("success"));
    },
    [methodData, details, options],
  );

  useEffect(
    () => postMessageStream.write({ type: "details", details }) && undefined,
    [postMessageStream, details],
  );

  useEffect(
    () => postMessageStream.on("data", ({type}) => (type === "request-payment") && requestPayment()) && undefined,
    [postMessageStream, requestPayment],
  );

  return null;
};

App.displayName = "App";

App.propTypes = {
  isServerSide: PropTypes.bool,
  methodData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  details: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
  path: PropTypes.string.isRequired,
  host: PropTypes.string.isRequired,
};

App.defaultProps = {
  isServerSide: false,
  options: {
    requestShipping: false,
    requestPayerEmail: false,
    requestPayerPhone: false,
  },
};

export default App;
