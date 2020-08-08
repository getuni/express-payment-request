import React, {useEffect, useCallback, useState} from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";
import axios from "axios";
import {encode as btoa} from "base-64";

// XXX: Obviously this is super apple-pay specific, but we can extend this in future.
const App = ({isServerSide, methodData, details, options, path, host, postMessageStream, ...extraProps}) => {
  const [paymentRequestAvailable] = useState(
    () => !!window.PaymentRequest,
    //() => (window.ApplePaySession && ApplePaySession.canMakePayments() && window.PaymentRequest),
  );
  const requestPay = useCallback(
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

      /* show payment request modal */
      return request.show()
        // TODO: modulate response? remember that the btoa can be exploited...
        .then(response => response.complete("success"));
    },
    [methodData, details, options],
  );

  useEffect(
    () => postMessageStream.write({ details }) && undefined,
    [postMessageStream, details],
  );

  useEffect(
    () => {
      // TODO: how to trigger?
      postMessageStream.on("data", (data) => {
        console.log('non root app got', data);
      });
    },
    [postMessageStream],
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
