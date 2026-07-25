import { Asset, injectTemplateData, ParsedStory, parseStorySource } from "@elvishscout/mdstory";
import templateUrl from "@elvishscout/mdstory/templates/default/dist/index.html?url";

export type PreviewResult = {
  previewUrl: string;
  downloadUrl: string;
  downloadName: string;
  /** Revoke all object URLs created during the build. */
  dispose: () => void;
};

const compileTemplate = (template: string) => {
  return (parsedStory: ParsedStory, assets: Record<string, Asset>, options?: Record<string, unknown>) => {
    parsedStory = structuredClone(parsedStory);
    parsedStory.metadata.assets = { ...parsedStory.metadata.assets, ...assets };

    const html = injectTemplateData(template, parsedStory, options);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    return url;
  };
};

const templatePromise = (async () => {
  const templateHtml = await (await fetch(templateUrl)).text();
  return compileTemplate(templateHtml);
})();

export const buildPreview = async (source: string, fileAssets: Record<string, File>): Promise<PreviewResult> => {
  const parsedStory = await parseStorySource(source);
  const title = parsedStory.metadata.title ?? "story";
  const template = await templatePromise;

  const urls: string[] = [];
  const previewAssets: Record<string, Asset> = {};
  const downloadAssets: Record<string, Asset> = {};

  for (const alias in fileAssets) {
    const file = fileAssets[alias];
    const mime = file.type;
    const previewAssetUrl = URL.createObjectURL(file);
    const downloadAssetUrl = await new Promise<string>((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    });
    previewAssets[alias] = { url: previewAssetUrl, mime };
    downloadAssets[alias] = { url: downloadAssetUrl, mime };
    urls.push(previewAssetUrl);
  }

  const previewUrl = template(parsedStory, previewAssets, { debug: true });
  const downloadUrl = template(parsedStory, downloadAssets);
  urls.push(previewUrl, downloadUrl);

  return {
    previewUrl,
    downloadUrl,
    downloadName: `${title}.html`,
    dispose: () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    },
  };
};
