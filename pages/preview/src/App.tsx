import { Asset, ParsedStory, parseStorySource } from "@elvishscout/mdstory";
import templateUrl from "@elvishscout/mdstory/templates/default/dist/index.html?url";
import { SyntheticEvent, useEffect, useState } from "react";

import { load } from "@/utils/save-load";

const compileTemplate = (template: string) => {
  return (parsedStory: ParsedStory, assets: Record<string, Asset>, options?: Record<string, unknown>) => {
    parsedStory = structuredClone(parsedStory);
    options ??= {};
    parsedStory.metadata.assets ??= {};
    Object.assign(parsedStory.metadata.assets, assets);

    const html = template
      .replace('"__PARSED_STORY__"', JSON.stringify(parsedStory))
      .replace('"__TEMPLATE_OPTIONS__"', JSON.stringify(options));
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    return url;
  };
};

export default function App() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const urls: string[] = [];

    const setupPage = async () => {
      const { source, fileAssets } = await load();

      let parsedStory;
      try {
        parsedStory = await parseStorySource(source);
      } catch (err) {
        handleError(err);
        return;
      }

      const title = parsedStory.metadata.title ?? "story";
      const templateHtml = await (await fetch(templateUrl)).text();
      const template = compileTemplate(templateHtml);

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

      const previewUrl = template(parsedStory, previewAssets, { showHeader: true, debug: true });
      const downloadUrl = template(parsedStory, downloadAssets, { showHeader: true });
      urls.push(previewUrl, downloadUrl);

      setPreviewUrl(previewUrl);
      setDownloadUrl(downloadUrl);
      setDownloadName(`${title}.html`);
      setState("ready");
    };
    setupPage();

    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  const handleError = (error: any) => {
    setErrorMessage("Error: " + (error instanceof Error ? error.message : String(error)));
    setState("error");
  };

  const handleIFrameLoad = (ev: SyntheticEvent<HTMLIFrameElement, Event>) => {
    const frameWindow = ev.currentTarget.contentWindow!;
    const frameDocument = ev.currentTarget.contentDocument!;
    const frameTitle = frameDocument.head.querySelector("title");
    const frameIcon = frameDocument.head.querySelector<HTMLLinkElement>("link[rel=icon]");

    frameWindow.addEventListener("error", (ev) => handleError(ev.error));
    frameWindow.addEventListener("unhandledrejection", (ev) => handleError(ev.reason));

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
      <div className="fixed bottom-4 right-4 z-50 max-w-64 px-3 py-2 rounded-lg shadow-lg bg-white border border-red-700">
        <p className="text-sm wrap-break-word">
          {state === "ready" && (
            <a className="button-text" href={downloadUrl} download={downloadName}>
              Download Standalone HTML
            </a>
          )}
          {state === "loading" && <span className="text-red-600">Loading</span>}
          {state === "error" && <span className="text-red-600">{errorMessage}</span>}
        </p>
      </div>
      <iframe className="grow" src={previewUrl || undefined} onLoad={handleIFrameLoad} />
    </div>
  );
}
