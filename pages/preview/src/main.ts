import "./style.css";

import { createPreview } from "./preview";
import { decodeAndDecompress } from "@/utils/compress";

const root = document.querySelector<HTMLDivElement>(".preview")!;

const createPage = async (root: HTMLElement) => {
  const { searchParams } = new URL(location.href);
  const content = searchParams.get("content");
  if (content !== null) {
    const decodedContent = await decodeAndDecompress(content);
    sessionStorage.setItem("content", decodedContent);
  }
  createPreview(root);
};

createPage(root);
