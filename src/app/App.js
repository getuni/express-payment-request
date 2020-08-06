import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";

import {MaybePaymentButton} from "./components";

const App = ({isServerSide, methodData, details, options, ...extraProps}) => {
  const [Button] = useState(
    () => !isServerSide ? withPaymentRequest()(MaybePaymentButton) : MaybePaymentButton
  );
  const onShowSuccess = useCallback(
    (result, resolve, reject) => {
      console.log('Result:', result);
    },
  );
  const onShowFail = useCallback(
    (error) => {
      console.error(error);
    },
  );
  const onMerchantValidation = useCallback(
    (e) => {
      console.log('merchant validation', e);
      //onMerchantValidation: (event) => {
      //    // XXX: Where to send the request?
      //    setTimeout(() => event.complete(Promise.resolve(event.validationURL)), 3000);
      //  },
    },
  );
  return (
    <Button
      config={{
        methodData,
        details,
        options,
        onShowSuccess,
        onShowFail,
        onMerchantValidation,
        /* ignored */
        onShippingAddressChange: (request, resolve, reject) => resolve(details),
        onShippingOptionChange: (request, resolve, reject) => resolve(details), 
      }}
    />
  );
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
