import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/layout/App/App";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
