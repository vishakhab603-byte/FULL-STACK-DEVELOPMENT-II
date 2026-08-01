import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App.jsx";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";
import "./index.css";

console.log(
  "%c🪶 QUILL",
  "font-size: 20px; font-weight: 700; color: #14213d;"
);
console.log(
  "%cevery quill needs a muse. poking around back here? respect. — the Muse",
  "color: #8b90a8; font-style: italic;"
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);
