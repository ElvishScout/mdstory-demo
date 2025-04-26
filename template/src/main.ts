import "./style.css";

import { createViewer } from "./viewer";

const root = document.querySelector("#root") as HTMLDivElement;
const template = document.querySelector("#content") as HTMLTemplateElement;
const content = template.content.querySelector("pre")!.textContent ?? "";

createViewer(root, content);
