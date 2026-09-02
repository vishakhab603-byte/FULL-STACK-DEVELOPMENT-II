import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Note: StrictMode intentionally omitted — this app relies on several
// custom hooks with side effects (timers, sfx, activity tracking) that
// were written assuming single-invocation effects, as in the original
// single-file version.
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
