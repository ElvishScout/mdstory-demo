import "./style.css";

import { createViewer } from "./viewer";

const root = document.querySelector<HTMLDivElement>("#root")!;
const template = document.querySelector<HTMLTemplateElement>("#content")!;
const pre = template.content.querySelector("pre")!;
const content = pre.textContent ?? "";

createViewer(root, content);
