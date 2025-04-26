import "./style.css";

import { createEditor } from "./editor";
import { decodeAndDecompress } from "@/utils/compress";

const root = document.querySelector<HTMLDivElement>(".editor")!;

const createPage = async (root: HTMLElement) => {
  const { searchParams } = new URL(location.href);
  const content = searchParams.get("content");
  if (content !== null) {
    const decodedContent = await decodeAndDecompress(content);
    sessionStorage.setItem("content", decodedContent);
  }
  createEditor(root);
};

createPage(root);
