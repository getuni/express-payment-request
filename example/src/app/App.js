import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";

function App({ postMessageStream }) {
  const [details, setDetails] = useState(null);
  useEffect(
    () => postMessageStream.on('data', ({type, details}) => (type === "details") && setDetails(details)) && undefined,
    [postMessageStream, setDetails],
  );
  return (
    <div>
      {!!details && (
        <div children={JSON.stringify(details)} />
      )}
      <button
        onClick={() => postMessageStream.write({ type: "request-payment" })}
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
