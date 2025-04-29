import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const template = document.querySelector<HTMLTemplateElement>("#content")!;
const pre = template.content.firstElementChild! as HTMLPreElement;
const content = pre.textContent ?? "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App content={content} />
  </StrictMode>
);
