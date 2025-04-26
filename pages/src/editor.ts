import { compressAndEncode } from "@/utils/compress";
import { FcEditor } from "@/components";

customElements.define("fc-editor", FcEditor, { extends: "textarea" });

export const createEditor = (root: HTMLElement) => {
  document.title = "Source Editor";

  const heading = document.createElement("h1");
  heading.classList.add("editor-heading");
  heading.innerText = "Source Editor";
  root.append(heading);

  const tools = document.createElement("div");
  tools.classList.add("editor-tools");
  root.append(tools);

  const label = document.createElement("label");
  tools.append(label);

  const span = document.createElement("span");
  span.innerText = "Tab size:";
  label.append(span);

  const select = document.createElement("select");
  label.append(select);

  for (let i = 1; i <= 8; i++) {
    const option = document.createElement("option");
    option.innerText = option.value = `${i}`;
    select.append(option);
  }

  const buttons = document.createElement("div");
  buttons.classList.add("button-group");
  tools.append(buttons);

  const copy = document.createElement("button");
  copy.type = "button";
  copy.innerText = "Copy URL";
  buttons.append(copy);

  const preview = document.createElement("button");
  preview.type = "button";
  preview.innerText = "Preview";
  buttons.append(preview);

  const editor = document.createElement("textarea", { is: "fc-editor" }) as FcEditor;
  editor.ariaLabel = "editor";
  root.append(editor);

  select.oninput = () => {
    editor.tabSize = parseInt(select.value);
  };
  select.value = "2";
  editor.tabSize = 2;

  copy.onclick = async () => {
    const encodedContent = await compressAndEncode(editor.value);
    const url = new URL(location.href);
    url.searchParams.set("mode", "editor");
    url.searchParams.set("content", encodedContent);
    navigator.clipboard.writeText(url.href);
    alert("URL copied to clipboard successfully.");
  };

  preview.onclick = () => {
    sessionStorage.setItem("content", editor.value);
    window.open("/preview/", "_blank");
  };

  const content = sessionStorage.getItem("content");
  if (content !== null) {
    editor.value = content;
  }
};
