import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { unescapeHtml } from "./utils.ts";

const sourceScript = document.querySelector<HTMLScriptElement>("#story-source")!;
const content = unescapeHtml(sourceScript.textContent!);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App content={content} />
  </StrictMode>,
);
