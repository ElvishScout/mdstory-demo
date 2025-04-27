import "./style.css";

import { createPreview } from "./preview";
import { decodeAndDecompressText } from "@/utils/compress";
import kvStore from "@/utils/kvstore";

const root = document.querySelector<HTMLDivElement>(".preview")!;

const createPage = async (root: HTMLElement) => {
  const { searchParams } = new URL(location.href);

  let content = searchParams.get("content");
  if (content !== null) {
    content = await decodeAndDecompressText(content);
  } else {
    content = await kvStore.get("content");
  }
  const fileAssets = (await kvStore.get<Record<string, File>>("assets")) ?? {};
  createPreview(root, content ?? "", fileAssets);
};

createPage(root);
