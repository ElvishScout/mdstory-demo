import { Asset, StoryBody, parseStorySource } from "@elvishscout/mdstory";
import { SyntheticEvent, useEffect, useState } from "react";

import { load } from "@/utils/save-load";

const compileTemplate = (template: string) => {
  return (storyBody: StoryBody, assets: Record<string, Asset>) => {
    storyBody = structuredClone(storyBody);
    storyBody.metadata.assets = assets;
    const storyBodyJson = JSON.stringify(storyBody);
    const storyBodyHtml = storyBodyJson.replace(/[&<>'"]/, (char) => `&#${char.charCodeAt(0)};`);
    const html = template.replace("{{story-body}}", storyBodyHtml);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    return url;
  };
};

export default function App() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");

  useEffect(() => {
    const urls: string[] = [];

    const setupPage = async () => {
      const response = await fetch("/template.html");
      const templateHtml = await response.text();
      const template = compileTemplate(templateHtml);

      const { source, fileAssets } = await load();
      const storyBody = parseStorySource(source);
      const title = storyBody.metadata.title ?? "story";

      const previewAssets: Record<string, Asset> = {};
      const downloadAssets: Record<string, Asset> = {};

      for (const alias in fileAssets) {
        const file = fileAssets[alias];
        const mime = file.type;
        const previewAssetUrl = URL.createObjectURL(file);
        const downloadAssetUrl = await new Promise<string>((resolve) => {
          const fileReader = new FileReader();
          fileReader.onload = async () => {
            const url = fileReader.result as string;
            resolve(url);
          };
          fileReader.readAsDataURL(file);
        });
        previewAssets[alias] = { url: previewAssetUrl, mime };
        downloadAssets[alias] = { url: downloadAssetUrl, mime };
        urls.push(previewAssetUrl);
      }

      const previewUrl = template(storyBody, previewAssets);
      const downloadUrl = template(storyBody, downloadAssets);
      urls.push(previewUrl, downloadUrl);

      setPreviewUrl(previewUrl);
      setDownloadUrl(downloadUrl);
      setDownloadName(`${title}.html`);
    };
    setupPage();

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const handleFrameLoad = (ev: SyntheticEvent<HTMLIFrameElement, Event>) => {
    const frameWindow = ev.currentTarget.contentWindow!;
    const frameDocument = ev.currentTarget.contentDocument!;
    const frameTitle = frameDocument.head.querySelector("title");
    const frameIcon = frameDocument.head.querySelector<HTMLLinkElement>("link[rel=icon]");

    frameWindow.addEventListener("error", (ev) => {
      console.error(ev.error);
    });

    if (frameTitle) {
      document.title = frameTitle.innerText;
      new MutationObserver(() => {
        document.title = frameTitle.innerText;
      }).observe(frameTitle, { childList: true });
    }
    if (frameIcon) {
      const icon = document.head.querySelector<HTMLLinkElement>("link[rel=icon]")!;
      icon.href = frameIcon.href;
      new MutationObserver(() => {
        icon.href = frameIcon.href;
      }).observe(frameIcon, { attributes: true });
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="px-4 py-2 flex justify-center border-b-2 border-red-700">
        <a className="button-text" href={downloadUrl} download={downloadName}>
          Download Standalone HTML
        </a>
      </div>
      <iframe className="grow" src={previewUrl || undefined} onLoad={handleFrameLoad} />
    </div>
  );
}
