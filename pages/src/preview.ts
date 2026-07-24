import { Asset, ParsedStory, parseStorySource } from "@elvishscout/mdstory";
import templateUrl from "@elvishscout/mdstory/templates/default/dist/index.html?url";

export type PreviewResult = {
  previewUrl: string;
  downloadUrl: string;
  downloadName: string;
  /** All object URLs created during the build; revoke when replaced. */
  urls: string[];
};

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

let templatePromise: Promise<ReturnType<typeof compileTemplate>> | null = null;

const getTemplate = () => {
  templatePromise ??= (async () => {
    const templateHtml = await (await fetch(templateUrl)).text();
    return compileTemplate(templateHtml);
  })();
  return templatePromise;
};

export const buildPreview = async (source: string, fileAssets: Record<string, File>): Promise<PreviewResult> => {
  const parsedStory = await parseStorySource(source);
  const title = parsedStory.metadata.title ?? "story";
  const template = await getTemplate();

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

  const previewUrl = template(parsedStory, previewAssets, { showHeader: true, debug: true });
  const downloadUrl = template(parsedStory, downloadAssets, { showHeader: true });
  urls.push(previewUrl, downloadUrl);

  return { previewUrl, downloadUrl, downloadName: `${title}.html`, urls };
};
