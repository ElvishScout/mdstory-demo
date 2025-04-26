import { Story, RenderOptions, StoryPrompt } from "@elvishscout/mdstory";
import { FcInput } from "@/components";

customElements.define("fc-input", FcInput);

export const createViewer = (root: HTMLElement, content: string) => {
  const story = new Story(content);

  if (story.stylesheet) {
    const style = document.createElement("style");
    style.innerHTML = story.stylesheet;
    document.head.append(style);
  }

  if (story.metadata.title) {
    document.title = story.metadata.title;
    const heading = document.createElement("h1");
    heading.classList.add("story-heading");
    heading.innerText = story.metadata.title;
    root.append(heading);
  }

  const storyChapters = document.createElement("div");
  storyChapters.classList.add("story-chapters");
  root.append(storyChapters);

  const cover = document.createElement("div");
  cover.classList.add("viewer-cover");
  cover.innerText = "Click to start";
  root.append(cover);

  cover.onclick = () => cover.remove();

  const prompt: StoryPrompt = async ({ text }) => {
    return new Promise((resolve) => {
      const chapter = document.createElement("div");
      chapter.classList.add("chapter");
      storyChapters.append(chapter);

      const form = document.createElement("form");
      form.innerHTML = text;
      chapter.append(form);

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

        chapter.classList.add("finished");
        resolve(formData);
      };

      const cover = document.createElement("div");
      cover.classList.add("chapter-cover");
      chapter.appendChild(cover);

      const animation = cover.animate([{ top: "-100%" }, { top: "100%" }], { duration: 1000 });
      animation.onfinish = () => cover.remove();
      animation.play();

      chapter.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const options: RenderOptions = {
    format: "html",
    tagMap: { input: "fc-input" },
  };

  window.addEventListener("click", () => story.play(prompt, options), { once: true });
};
