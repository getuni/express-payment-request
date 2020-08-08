import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";
import axios from "axios";
import {encode as btoa} from "base-64";

// XXX: Obviously this is super apple-pay specific, but we can extend this in future.
const App = ({isServerSide, methodData, details, options, path, host, ...extraProps}) => {
  const [paymentRequestAvailable] = useState(
    () => !!window.PaymentRequest,
    //() => (window.ApplePaySession && ApplePaySession.canMakePayments() && window.PaymentRequest),
  );
  const onClickPay = useCallback(
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
      /* show payment request modal */
      return request.show()
        // TODO: modulate response? remember that the btoa can be exploited...
        .then(response => response.complete("success"))
        .catch(console.error);
    },
    [methodData, details, options],
  );
  if (paymentRequestAvailable) {
    // TODO: Use a nice graphic!
    return (
      <div>
        <button
          onClick={() => onClickPay().then(console.log).catch(console.error)}
          children="Pay"
        />
      </div>
    );
  }
  return "Sorry, Payment is not supported.";
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
