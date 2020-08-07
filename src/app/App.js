import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";

import {MaybePaymentButton} from "./components";

const App = ({isServerSide, methodData, details, options, ...extraProps}) => {
  const onClick = useCallback(
    () => {
      if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
        console.log('supported');
        var request = null;
        if (window.PaymentRequest) {
          console.log('found payment request obj');
          // TODO: should be methods
          request = new PaymentRequest(methodData, details, options);
          console.log('made request');

          console.log('setting validation');
          request.onmerchantvalidation = function (event) {
            console.log('got validation');
            console.log('event is', event);
            console.log(event.validationURL);
            // TODO: what the hell is this part?
            const sessionPromise = Promise.resolve(event.validationURL);
            console.log('about to complete');
            event.complete(sessionPromise);
          };
          
          request.show()
            .then(console.log)
            .catch(console.error);
          //const status = processResponse(response);
          //response.complete(status);
        } else {
          console.log('consider apple pay js instead');
        // Consider using Apple Pay JS instead.
        }
      } else {
        console.log('not supported');
      }
    },
  );
  return (
    <div>
      <button
        onClick={onClick}
        children="Pay"
      />
    </div>
  );
  //const [Button] = useState(
  //  () => !isServerSide ? withPaymentRequest()(MaybePaymentButton) : MaybePaymentButton
  //);
  //const onShowSuccess = useCallback(
  //  (result, resolve, reject) => {
  //    console.log('Result:', result);
  //    resolve(result);
  //    alert(result);
  //  },
  //);
  //const onShowFail = useCallback(
  //  (error) => {
  //    console.error(error);
  //    alert(error);
  //  },
  //);
  //const onMerchantValidation = useCallback(
  //  (event) => {
  //    console.log(event);
  //    event.complete(Promise.resolve(event.validationURL));
  //  },
  //);
  //return (
  //  <Button
  //    config={{
  //      methodData,
  //      details,
  //      options,
  //      onShowSuccess,
  //      onShowFail,
  //      onMerchantValidation,
  //      /* ignored */
  //      onShippingAddressChange: (request, resolve, reject) => resolve(details),
  //      onShippingOptionChange: (request, resolve, reject) => resolve(details), 
  //    }}
  //  />
  //);
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
