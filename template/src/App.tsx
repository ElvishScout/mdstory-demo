import { StoryBase, StoryBody, StoryPrompt } from "@elvishscout/mdstory";
import { memo, SyntheticEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import parse, { domToReact, DOMNode, HTMLReactParserOptions, Element as ParserElement } from "html-react-parser";
import { produce } from "immer";

import FcInput from "./components/fc-input";

const dataUrlToObjectUrl = (dataUrl: string) => {
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
  const blob = new Blob([blobPart], { type });

  return URL.createObjectURL(blob);
};

const parserOptions = (enabled: boolean): HTMLReactParserOptions => ({
  replace(node) {
    if (node.type === "tag") {
      node = node as ParserElement;
      if (node.tagName === "fc-input") {
        const { type, name, value, checked } = node.attribs;
        return (
          <FcInput
            className="
              mx-1 [&.fc-input-text]:border-b-2 [&.fc-input-text]:border-red-700
              [&_.fc-circle]:border-2 [&_.fc-circle]:border-red-700 [&_.fc-circle]:rounded-full
              [&.fc-input-text]:has-disabled:bg-red-100
            "
            type={type}
            name={name}
            defaultValue={value}
            defaultChecked={checked !== undefined}
            disabled={!enabled}
          />
        );
      } else if (node.tagName === "fc-button") {
        const { type, name, value } = node.attribs;
        return (
          <button
            className="mx-0.5 text-red-600 hover:text-red-400 active:text-red-300 disabled:text-red-600 underline cursor-pointer"
            type={type as "button" | "submit" | "reset" | undefined}
            name={name}
            value={value}
            disabled={!enabled}
          >
            {domToReact(node.childNodes as DOMNode[], parserOptions(enabled))}
          </button>
        );
      }
    }
  },
});

const FormBody = memo(({ html, enabled }: { html: string; enabled: boolean }) => {
  return parse(html, parserOptions(enabled));
});

type ChapterLog = {
  html: string;
};

export default function App({ content }: { content: string }) {
  const [started, setStarted] = useState(false);
  const [title, setTitle] = useState("");
  const [chapters, setChapters] = useState<ChapterLog[]>([]);

  const storyRef = useRef<StoryBase | null>(null);
  const chapterRef = useRef<HTMLDivElement>(null);
  const chapterCoverRef = useRef<HTMLDivElement>(null);
  const resolveRef = useRef<(formData: FormData) => void>(null);

  useEffect(() => {
    let oldTitle: string | null = null;
    const urls: string[] = [];
    if (content) {
      const storyBody = JSON.parse(content) as StoryBody;
      const assets = storyBody.metadata.assets;
      if (assets) {
        for (const alias in assets) {
          const { url } = assets[alias];
          if (assets[alias].url.startsWith("data:")) {
            const objectUrl = dataUrlToObjectUrl(url);
            assets[alias].url = objectUrl;
            urls.push(objectUrl);
          }
        }
      }
      const story = new StoryBase(storyBody);
      storyRef.current = story;

      oldTitle = document.title;
      const title = storyBody.metadata.title ?? "MdStory";
      document.title = title;
      setTitle(title);
    }
    return () => {
      if (oldTitle !== null) {
        document.title = oldTitle;
      }
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [content]);

  useLayoutEffect(() => {
    const chapter = chapterRef.current;
    const cover = chapterCoverRef.current;
    if (chapter) {
      chapter.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (cover) {
      const animation = cover.animate([{ top: "-100%" }, { top: "100%" }], { duration: 1000 });
      animation.play();
    }
  }, [chapters]);

  const prompt: StoryPrompt = async ({ text }) => {
    setChapters(
      produce((draft) => {
        draft.push({ html: text });
      })
    );
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  };

  const handleCoverClick = () => {
    const story = storyRef.current;
    if (story) {
      story.play(prompt, { format: "html", tagMap: { input: "fc-input", button: "fc-button" } });
      setStarted(true);
    }
  };

  const handleFormSubmit = (ev: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    ev.preventDefault();
    if (resolveRef.current) {
      const formData = new FormData(ev.currentTarget, ev.nativeEvent.submitter);
      resolveRef.current(formData);
      resolveRef.current = null;
    }
  };

  return (
    <div className="px-2 md:px-12 py-4 md:py-8 md:text-lg">
      <h1 className="mb-4 text-3xl text-center">{title}</h1>
      <div>
        {chapters.map(({ html }, i) => {
          const enabled = i === chapters.length - 1;
          return (
            <div
              key={i}
              ref={enabled ? chapterRef : undefined}
              className={`relative mt-8 px-2 pb-8 last:pb-[25vh] first:mt-0 border-b-2 border-red-700 last:border-none overflow-hidden ${
                !enabled ? "opacity-50" : ""
              }`}
            >
              <form className="chapter-form" onSubmit={enabled ? handleFormSubmit : (ev) => ev.preventDefault()}>
                <FormBody html={html} enabled={enabled} />
              </form>
              {enabled && (
                <div
                  ref={chapterCoverRef}
                  className="absolute left-0 right-0 top-[100%] h-[200%] bg-linear-[to_bottom,transparent_0%,#ffffff_50%,#ffffff_100%] z-10"
                ></div>
              )}
            </div>
          );
        })}
      </div>
      {!started && (
        <div
          className="fixed inset-0 flex flex-col justify-center items-center text-4xl leading-0 select-none backdrop-blur-xs z-10 after:content-[''] after:h-16"
          onClick={handleCoverClick}
        >
          Click to start
        </div>
      )}
    </div>
  );
}
