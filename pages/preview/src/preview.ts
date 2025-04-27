import { parseStoryContent, Asset } from "@elvishscout/mdstory";

const insertContent = async (text: string, content: string, fileAssets: Record<string, File>) => {
  const assets = Object.fromEntries(
    await Promise.all(
      Object.entries(fileAssets).map(async ([alias, file]) => {
        return new Promise<[string, Asset]>((resolve) => {
          const fileReader = new FileReader();
          fileReader.onload = async () => {
            const url = fileReader.result as string;
            resolve([alias, { url, mime: file.type }]);
          };
          fileReader.readAsDataURL(file);
        });
      })
    )
  );
  const storyBody = parseStoryContent(content);
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

  const srcdoc = await insertContent(template, content, assets);
  const blob = new Blob([srcdoc], { type: "text/html" });
  const dataUrl = URL.createObjectURL(blob);

  const anchor = root.querySelector<HTMLAnchorElement>("a[download]")!;
  const frame = root.querySelector<HTMLIFrameElement>("iframe[title=preview]")!;

  anchor.href = dataUrl;
  frame.src = dataUrl;

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
