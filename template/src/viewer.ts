import { RenderOptions, StoryPrompt, StoryBody, StoryBase } from "@elvishscout/mdstory";
import { FcInput } from "@/components";

customElements.define("fc-input", FcInput);

const dataUrlToBlob = (dataUrl: string) => {
  const commaIndex = dataUrl.indexOf(",");
  const head = dataUrl.substring(0, commaIndex + 1);
  const body = dataUrl.substring(commaIndex + 1);

  const [, type, base64] = head.match(/^data:(.*?)(;base64)?,$/)!;

  let blobPart;
  if (base64 !== undefined) {
    blobPart = Uint8Array.from(Array.from(atob(body), (char) => char.charCodeAt(0)));
  } else {
    blobPart = decodeURIComponent(body);
  }
  return new Blob([blobPart], { type });
};

export const createViewer = (root: HTMLElement) => {
  const contentTemplate = document.querySelector<HTMLTemplateElement>("#content")!;
  const preContent = contentTemplate.content.firstElementChild! as HTMLPreElement;
  const content = preContent.textContent ?? "";

  const storyBody = JSON.parse(content) as StoryBody;
  const assets = storyBody.metadata.assets;
  if (assets) {
    for (const name in assets) {
      if (assets[name].url.startsWith("data:")) {
        const blob = dataUrlToBlob(assets[name].url);
        const objectUrl = URL.createObjectURL(blob);
        assets[name].url = objectUrl;
      }
    }
  }
  const story = new StoryBase(storyBody);

  const chapterTemplate = root.querySelector<HTMLTemplateElement>("#chapter-template")!;
  const chapter = chapterTemplate.content.firstElementChild! as HTMLDivElement;

  const cover = root.querySelector<HTMLDivElement>("div.viewer-cover")!;
  const storyChapters = root.querySelector<HTMLDivElement>("div.story-chapters")!;

  if (story.stylesheet) {
    const style = document.createElement("style");
    style.innerHTML = story.stylesheet;
    document.head.append(style);
  }

  if (story.metadata.title) {
    document.title = story.metadata.title;
    const heading = root.querySelector<HTMLHeadingElement>("h1.story-heading")!;
    heading.innerText = story.metadata.title;
  }

  cover.onclick = () => cover.remove();

  const prompt: StoryPrompt = async ({ text }) => {
    return new Promise((resolve) => {
      const newChapter = chapter.cloneNode(true) as HTMLDivElement;
      storyChapters.append(newChapter);

      const chapterCover = newChapter.querySelector<HTMLDivElement>("div.chapter-cover")!;
      const form = newChapter.querySelector<HTMLFormElement>("form")!;
      form.innerHTML = text;

      let submitted = false;
      form.onsubmit = (ev) => {
        ev.preventDefault();
        if (submitted) {
          return;
        }
        submitted = true;
        const formData = new FormData(form, ev.submitter);
        for (const input of form.querySelectorAll("input")) {
          input.disabled = true;
        }
        for (const button of form.querySelectorAll("button")) {
          button.disabled = true;
        }
        newChapter.classList.add("finished");
        resolve(formData);
      };

      const animation = chapterCover.animate([{ top: "-100%" }, { top: "100%" }], { duration: 1000 });
      animation.onfinish = () => cover.remove();
      animation.play();

      newChapter.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const options: RenderOptions = {
    format: "html",
    tagMap: { input: "fc-input" },
  };

  window.addEventListener("click", () => story.play(prompt, options), { once: true });
};
