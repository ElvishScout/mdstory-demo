import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const template = document.querySelector<HTMLTemplateElement>("#story-body")!;
const content = template.content.textContent ?? "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App content={content} />
  </StrictMode>
);
