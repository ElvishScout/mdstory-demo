import "./style.css";

import { createEditor } from "./editor";
import { decodeAndDecompressText } from "@/utils/compress";
import kvStore from "@/utils/kvstore";

const root = document.querySelector<HTMLDivElement>("#root")!;

const createPage = async (root: HTMLElement) => {
  const { searchParams } = new URL(location.href);

  let content = searchParams.get("content");
  if (content !== null) {
    content = await decodeAndDecompressText(content);
  } else {
    content = await kvStore.get("content");
  }
  createEditor(root, content ?? "");
};

createPage(root);
