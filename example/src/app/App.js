import React, {useEffect} from "react";
import PropTypes from "prop-types";

function App({ postMessageStream }) {
  useEffect(
    () => {
      postMessageStream.on('data', (data) => console.log('i got data', data))
    },
    [postMessageStream],
  );
  return (
    <div>
      <button
        onClick={() => {
          postMessageStream.write({ type: "please pay" });
        }}
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
