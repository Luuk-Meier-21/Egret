import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { PrismaClient } from "@prisma/client";
import { ErrorBoundary } from "react-error-boundary";

export const prisma = new PrismaClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
