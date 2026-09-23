import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminServices from "./admin/AdminServices";
import AdminRequests from "./admin/AdminRequests";

import "./index.css";

const path = window.location.pathname;

let Page;

if (path === "/admin") {
  Page = AdminLogin;
} else if (path === "/admin/dashboard") {
  Page = AdminDashboard;
} else if (path === "/admin/services") {
  Page = AdminServices;
} else if (path === "/admin/requests") {
  Page = AdminRequests;
} else {
  Page = App;
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <Page />
  </React.StrictMode>
);