import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";

import {MaybePaymentButton} from "./components";

// XXX: Obviously this is super apple-pay specific, but we can extend this in future.
const App = ({isServerSide, methodData, details, options, ...extraProps}) => {
  const [applyPayAvailable] = useState(
    () => (window.ApplePaySession && ApplePaySession.canMakePayments() && window.PaymentRequest),
  );
  const onClick = useCallback(
    () => {
      if () {
        const request = new PaymentRequest(methodData, details, options);
        request.onmerchantvalidation = (event) => {
          console.log('event is', event);
          console.log(event.validationURL);
          // TODO: Manage internal negotation of the payment? Use express _somehow_.
          //       How to actually let it through.
          const sessionPromise = Promise.resolve(event.validationURL);
          // XXX: TODO: Completion state should be defined by the api.
          return new Promise(resolve => setTimeout(resolve, 2000))
            .then(() => event.complete("success"));
        };
        return request.show();
      }
      return Promise.reject(new Error(`Sorry, payment is not supported.`));
    },
  );
  if (applePayAvailable) {
    // TODO: Use a nice graphic!
    return (
      <button
        onClick={() => onClick().then(console.log).catch(console.error)}
        children="Pay with ApplePay"
      />
    );
  }
  return "Sorry, Apple Pay is not supported.";
};

App.displayName = "App";

App.propTypes = {
  isServerSide: PropTypes.bool,
  methodData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  details: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({}),
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
