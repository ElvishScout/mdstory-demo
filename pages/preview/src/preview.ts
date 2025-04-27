import { parseStoryContent, Asset, StoryBody } from "@elvishscout/mdstory";

const insertContent = async (
  text: string,
  storyBody: StoryBody,
  fileAssets: Record<string, File>,
  mode: "preview" | "standalone"
) => {
  const assets: Record<string, Asset> = Object.fromEntries(
    await Promise.all(
      Object.entries(fileAssets).map(async ([alias, file]) => {
        const mime = file.type;
        let url: string;
        if (mode === "preview") {
          url = URL.createObjectURL(file);
        } else {
          url = await new Promise<string>((resolve) => {
            const fileReader = new FileReader();
            fileReader.onload = async () => {
              const url = fileReader.result as string;
              resolve(url);
            };
            fileReader.readAsDataURL(file);
          });
        }
        return [alias, { url, mime }];
      })
    )
  );
  storyBody = structuredClone(storyBody);
  storyBody.metadata.assets = { ...storyBody.metadata.assets, ...assets };

  const dom = new DOMParser().parseFromString(text, "text/html");
  const template = dom.querySelector<HTMLTemplateElement>("#content")!;

  const preContent = template.content.firstElementChild! as HTMLPreElement;
  preContent.textContent = JSON.stringify(storyBody);

  let source = dom.documentElement.outerHTML;
  const { doctype } = dom;
  if (doctype) {
    const { name, publicId, systemId } = doctype;
    const doctypeStr =
      "<!DOCTYPE" +
      (name ? ` ${name}` : "") +
      (publicId ? ` PUBLIC "${publicId}"` : "") +
      (systemId ? ` "${systemId}"` : "") +
      ">";
    source = doctypeStr + source;
  }

  return source;
};

export const createPreview = async (root: HTMLElement, content: string, assets: Record<string, File>) => {
  const response = await fetch("/template.html");
  if (!response.ok) {
    throw "failed to fetch template.html";
  }
  const template = await response.text();

  const storyBody = parseStoryContent(content);
  const html = await insertContent(template, storyBody, assets, "preview");
  const blob = new Blob([html], { type: "text/html" });
  const previewUrl = URL.createObjectURL(blob);

  const anchor = root.querySelector<HTMLAnchorElement>("a[download]")!;
  const frame = root.querySelector<HTMLIFrameElement>("iframe[title=preview]")!;

  let standaloneUrl: string | null = null;
  anchor.onclick = async (ev) => {
    if (standaloneUrl === null) {
      ev.preventDefault();
      const html = await insertContent(template, storyBody, assets, "standalone");
      const blob = new Blob([html], { type: "text/html" });
      standaloneUrl = URL.createObjectURL(blob);
      const title = storyBody.metadata.title?.trim() || "download";
      anchor.download = `${title}.html`;
      anchor.href = standaloneUrl;
      anchor.click();
    }
  };

  frame.src = previewUrl;
  frame.onload = () => {
    frame.contentWindow!.addEventListener("error", (ev) => {
      console.error(ev.error);
    });

    const frameTitle = frame.contentDocument!.head.querySelector("title");
    const frameIcon = frame.contentDocument!.head.querySelector<HTMLLinkElement>("link[rel=icon]");

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
};
