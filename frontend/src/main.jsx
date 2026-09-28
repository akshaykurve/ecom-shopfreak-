import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { store } from "./store/store";
import { setAuthChangeHandler } from "./config/axiosInstance";
import { tokenRefreshed } from "./features/auth/authSlice";

// When axiosInstance silently refreshes (or gives up on) the access token
// outside of a normal thunk (e.g. a 401 on some unrelated request), it calls
// this handler so the Redux store stays in sync with what's actually usable.
setAuthChangeHandler((token) => {
  store.dispatch(tokenRefreshed(token));
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <App />
          <ToastContainer position="top-right" autoClose={2500} theme="colored" />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
