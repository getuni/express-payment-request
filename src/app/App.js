import React from "react";
import PropTypes from "prop-types";

const App = ({...extraProps}) => {
  return (
    <div
      children="hello, wooorld from React"
    />
  );
};

App.displayName = "App";

App.propTypes = {};

App.defaultProps = {};

export default App;
