import React from "react";
import {render} from "react-dom";
import PostMessageStream from "post-message-stream";

const postMessageStream = new PostMessageStream({
  name: "express-payment-request@consumer",
  target: "express-payment-request@provider",
});

import App from "./App";

render(<App postMessageStream={postMessageStream}/>, document.getElementById("root"));
