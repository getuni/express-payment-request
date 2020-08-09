import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";

function App({ postMessageStream }) {
  const [details, setDetails] = useState(null);
  const [result, setResult] = useState(null);
  useEffect(
    () => postMessageStream.on(
      "data",
      ({type, ...extras}) => {
        if (type === "details") {
          const {details} = extras;
          return setDetails(details);
        } else if (type === "result") {
          const {result} = extras;
          return setResult(result);
        }
        return console.warn(`Encountered unexpected type, "${type}".`);
      },
    ),
    [postMessageStream, setDetails],
  );
  useEffect(
    () => {
      if (!!result) {
        return postMessageStream.write({type: "resolve"}) && undefined;
      }
      return undefined;
    },
    [postMessageStream, result],
  );
  return (
    <div>
      {!!details && (
        <div children={JSON.stringify(details)} />
      )}
      <button
        onClick={() => postMessageStream.write({type: "request-payment"})}
        style={{
          backgroundColor: "pink",
        }}
        children="Custom Payment Button"
      />
    </div>
  );
}

App.displayName = "App";

App.propTypes = {
  postMessageStream: PropTypes.shape({}).isRequired,
};

App.defaultProps = {};

export default App;
