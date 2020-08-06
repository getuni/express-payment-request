import React from "react";
import PropTypes from "prop-types";
import withPaymentRequest from "react-payment-request-api";

function PaymentButton({show, isSupported, style}) {
  if (isSupported) {
    return <button style={style} onClick={show} children="Pay." />;
  }
  return null;
}

export default withPaymentRequest()(PaymentButton);
