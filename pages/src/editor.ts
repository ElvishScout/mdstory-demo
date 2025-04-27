import { compressAndEncodeText } from "@/utils/compress";
import { FcEditor } from "@/components";
import kvStore from "@/utils/kvstore";

customElements.define("fc-editor", FcEditor, { extends: "textarea" });

export type FileAsset = {
  alias: string;
  file: File;
};

export const createEditor = (root: HTMLElement, content: string) => {
  const assets: Record<number, FileAsset> = {};
  let count = 0;

  const inputUpload = root.querySelector<HTMLInputElement>("input[name=input-upload]")!;
  const buttonUpload = root.querySelector<HTMLButtonElement>("button[name=button-upload]")!;
  const assetsList = root.querySelector<HTMLDivElement>("div.assets-list")!;
  const template = root.querySelector<HTMLTemplateElement>("#asset-entry")!;
  const assetEntry = template.content.firstElementChild! as HTMLDivElement;

  buttonUpload.onclick = () => {
    inputUpload.click();
  };

  inputUpload.onchange = () => {
    if (!inputUpload.files) {
      return;
    }
    for (const file of inputUpload.files) {
      const id = count++;

      assets[id] = { alias: file.name, file: file };

      const newEntry = assetEntry.cloneNode(true) as HTMLDivElement;
      assetsList.append(newEntry);

      const [input, span, button] = newEntry.children as unknown as [
        HTMLInputElement,
        HTMLSpanElement,
        HTMLButtonElement
      ];

      input.value = file.name;
      span.innerText = file.name;

      input.readOnly = true;
      input.ondblclick = () => {
        input.readOnly = false;
      };
      input.onchange = () => {
        assets[id].alias = input.value;
        input.readOnly = true;
      };
      input.onkeydown = (ev) => {
        if (ev.key === "Enter") {
          input.readOnly = true;
        }
      };
      input.onblur = () => {
        input.readOnly = true;
      };
      button.onclick = () => {
        delete assets[id];
        newEntry.remove();
      };
    }
    inputUpload.value = "";
  };

  const select = root.querySelector<HTMLSelectElement>("select[name=tab-size]")!;
  const copy = root.querySelector<HTMLButtonElement>("button[name=copy]")!;
  const preview = root.querySelector<HTMLButtonElement>("button[name=preview]")!;
  const editor = root.querySelector<FcEditor>("textarea[name=editor]")!;

  select.value = "2";
  select.oninput = () => {
    editor.tabSize = parseInt(select.value);
  };

  editor.ariaLabel = "editor";
  editor.value = content;
  editor.tabSize = parseInt(select.value);

  copy.onclick = async () => {
    const encodedContent = await compressAndEncodeText(editor.value);
    const url = new URL(location.href);
    url.searchParams.set("content", encodedContent);
    navigator.clipboard.writeText(url.href);
    alert("URL copied to clipboard successfully.");
  };

  preview.onclick = async () => {
    const assetsObj = Object.fromEntries(Object.values(assets).map(({ alias, file }) => [alias, file]));
    await kvStore.set("content", editor.value);
    await kvStore.set("assets", assetsObj);
    window.open("/preview/", "_blank");
  };
};
