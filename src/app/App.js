import React, {useEffect, useCallback, useState} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {encode as btoa} from "base-64";

// XXX: Obviously this is super apple-pay specific, but we can extend this in future.
const App = ({isServerSide, methodData, details, options, path, host, postMessageStream, deepLinkUri, forceApplePayJS, ...extraProps}) => {
  const [latch] = useState([{
    resolve: null, reject: null, result: null,
  }]);

  const shouldReturnResult = useCallback(
    (result) => {
      if (!!deepLinkUri) {
        const q = deepLinkUri.includes("?") ? "&" : "?";
        window.location.href = `${deepLinkUri}${q}paymentResult=${btoa(JSON.stringify(result))}`;
      }
      return undefined;
    },
    [deepLinkUri],
  );

  const shouldResolve = useCallback(
    () => Promise
      .resolve()
      .then(
        () => {
          const {resolve, result} = latch[0];
          return resolve(result);
        },
      )
      .then(() => latch[0].result)
      .then(result => shouldReturnResult(result)),
    [latch, deepLinkUri, shouldReturnResult],
  );
  const shouldReject = useCallback(() => latch[0].reject(new Error("Implementor rejected payment completion.")), [latch]);

  const shouldUseApplePayJS = forceApplePayJS && window.ApplePaySession && ApplePaySession.canMakePayments();

  const requestPayment = useCallback(
    () => {
      if (!window.PaymentRequest) {
        return Promise.reject(new Error(`Payment Requests are not supported on this browser.`));
      }

      latch[0].result = null;

      if (shouldUseApplePayJS) {
        const session = new ApplePaySession(
          1,
          // TODO: need to abstract this configuration
          {
            // TODO: need to iterate across the payment object
            countryCode: "US",
            merchantCapabilities: [
              "supports3DS"
            ],
            supportedNetworks: [
              "visa",
              "masterCard",
              "amex",
              "discover"
            ],
            currencyCode: details.total.amount.currency,
            total: {
              type: "final",
              label: details.total.label,
              amount: details.total.amount.value,
            },
          },
        );

        session.onvalidatemerchant = (event) => {
          const {validationURL: url} = event;
          return new Promise(
            (resolve, reject) => {

              latch[0].resolve = () => Promise
                .resolve()
                .then(() => session.completePayment(ApplePaySession.STATUS_SUCCESS))
                .then(resolve);

              latch[0].reject = reject;

              return axios({url: `${host}${path}/validate?url=${btoa(url)}`, method: "get"})
                .then(({data}) => data)
                .then(merchantSession => session.completeMerchantValidation(merchantSession));
            },
          );
        };

        session.onpaymentauthorized = function (event) {
          const {payment: {token: result}} = event;
          latch[0].result = result;
          return postMessageStream.write({type: "result", result});
        };

        return session.begin();
      }

      const request = new PaymentRequest(methodData, details, options);

      request.onmerchantvalidation = (event) => {
        const {validationURL: url} = event;
        return event
          .complete(
            new Promise(
              (resolve, reject) => {
                latch[0].resolve = resolve;
                latch[0].reject = reject;
                return axios({url: `${host}${path}/validate?url=${btoa(url)}`, method: "get"})
                  .then(({data}) => data)
                  .then(
                    (result) => {
                      latch[0].result = result;
                      return postMessageStream.write({type: "result", result});
                    },
                  );
              },
            ),
            false,
          );
      };

      return request.show()
        .then(response => response.complete("success"));
    },
    [postMessageStream, methodData, details, options, latch, shouldUseApplePayJS],
  );

  useEffect(
    () => postMessageStream.write({type: "details", details}) && undefined,
    [postMessageStream, details],
  );

  useEffect(
    () => postMessageStream.on(
      "data",
      ({type, ...extras}) => {
        if (type === "request-payment") {
          return requestPayment();
        } else if (type === "resolve") {
          return shouldResolve();
        } else if (type === "reject") {
          return shouldReject();
        }
        return console.warn(`Encountered unexpected type, "${type}". This will be ignored.`);
      },
    ) && undefined,
    [postMessageStream, requestPayment, shouldResolve, shouldReject],
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
  deepLinkUri: PropTypes.string,
  forceApplePayJS: PropTypes.bool,
};

App.defaultProps = {
  isServerSide: false,
  options: {
    requestShipping: false,
    requestPayerEmail: false,
    requestPayerPhone: false,
  },
  deepLinkUri: null,
  forceApplePayJS: false,
};

export default App;
