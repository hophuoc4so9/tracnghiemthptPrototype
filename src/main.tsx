import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";

import { store } from "@/stores";
import { Provider as ReduxProvider } from "react-redux";
import AuthProvider from "./contexts/AuthProvider";
import { router } from "./routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
   
      <ReduxProvider store={store}>
        <AuthProvider>
          <RouterProvider router={createBrowserRouter(router)} />
        </AuthProvider>
      </ReduxProvider>

  </StrictMode>
);
