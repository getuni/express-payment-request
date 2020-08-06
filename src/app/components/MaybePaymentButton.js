import React from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";

function MaybePaymentButton({show, isSupported, style}) {
  if (isSupported) {
    return <button style={style} onClick={show} children="Pay." />;
  }
  return <div children="Payment is not supported on this device. :(" />
}

export default withPaymentRequest()(MaybePaymentButton);
