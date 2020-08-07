import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";
import axios from "axios";
import {encode as btoa} from "base-64";

// XXX: Obviously this is super apple-pay specific, but we can extend this in future.
const App = ({isServerSide, methodData, details, options, path, host, ...extraProps}) => {
  console.warn('host is', host);
  const [applePayAvailable] = useState(
    () => (window.ApplePaySession && ApplePaySession.canMakePayments() && window.PaymentRequest),
  );
  const onClickApplePay = useCallback(
    () => {
      const request = new PaymentRequest(methodData, details, options);
      request.onmerchantvalidation = (event) => {
        const {validationURL: url} = event;
        return axios({
          url: `${host}${path}/validate?url=${btoa(url)}`,
          method: 'get',
        })
          .then(
            ({data}) => {
              console.warn('got data!', data);
              return event.complete(Promise.resolve(data));
            },
          )
          //.then(({data}) => console.log(data)) // TODO: event.complete(data)
          .catch(console.error);
      };

      /* show Apple Pay modal */
      return request.show()
        .then(() => console.log('would mark success'));
        /* mark as successful */
        //.then(response => response.complete("success"));
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
