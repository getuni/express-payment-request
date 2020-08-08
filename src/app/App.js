import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";
import axios from "axios";
import {encode as btoa} from "base-64";

// XXX: Obviously this is super apple-pay specific, but we can extend this in future.
const App = ({isServerSide, methodData, details, options, path, host, ...extraProps}) => {
  const [applePayAvailable] = useState(
    () => (window.ApplePaySession && ApplePaySession.canMakePayments() && window.PaymentRequest),
  );
  const onClickApplePay = useCallback(
    () => {
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
      /* show Apple Pay modal */
      return request.show()
        .then((e) => console.log('did finished showing', e))
        //.then(response => response.complete("success"))
        //.then(() => console.log('did finish'))
        .catch(console.error);
    },
    [methodData, details, options],
  );
  if (applePayAvailable) {
    // TODO: Use a nice graphic!
    return (
      <div>
        <button
          onClick={() => onClickApplePay().then(console.log).catch(console.error)}
          children="Pay with ApplePay"
        />
      </div>
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
