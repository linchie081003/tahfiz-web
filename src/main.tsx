import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { GameToastProvider } from "./components/game/GameToast";
import { AgeModeProvider } from "./context/AgeModeContext";
import "./index.css";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AgeModeProvider>
          <GameToastProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </GameToastProvider>
        </AgeModeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
