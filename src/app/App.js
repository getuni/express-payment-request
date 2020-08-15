import React, {useEffect, useCallback, useState} from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {encode as btoa} from "base-64";

// XXX: Obviously this is super apple-pay specific, but we can extend this in future.
const App = ({isServerSide, methodData, details, options, path, host, postMessageStream, deepLinkUri, ...extraProps}) => {
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

  const requestPayment = useCallback(
    () => {
      if (!window.PaymentRequest) {
        return Promise.reject(new Error(`Payment Requests are not supported on this browser.`));
      }
      
      latch[0].result = null;

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
    [postMessageStream, methodData, details, options, latch],
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
};

App.defaultProps = {
  isServerSide: false,
  options: {
    requestShipping: false,
    requestPayerEmail: false,
    requestPayerPhone: false,
  },
  deepLinkUri: null,
};

export default App;
