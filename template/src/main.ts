import "./style.css";

import { createViewer } from "./viewer";

const root = document.querySelector<HTMLDivElement>("#root")!;

createViewer(root);
