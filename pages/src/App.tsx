import { useRef, useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { produce } from "immer";
import { LanguageDescription, LanguageSupport, indentUnit } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { yamlFrontmatter } from "@codemirror/lang-yaml";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";

import { save, load } from "@/utils/save-load";
import { compress, decompress } from "@/utils/zip";
import { theme } from "./theme";
import { markdownHandlebars } from "./extension";

type AssetEntry = {
  alias: string;
  file: File;
  readonly: boolean;
};

export default function App() {
  const tabSizeOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  const inputAssets = useRef<HTMLInputElement>(null);
  const inputArchive = useRef<HTMLInputElement>(null);
  const anchorArchive = useRef<HTMLAnchorElement>(null);
  const sourceRef = useRef("");

  const [assetList, setAssetList] = useState<AssetEntry[]>([]);
  const [tabSize, setTabSize] = useState(2);
  const [source, setSource] = useState("");

  const extensions = [
    theme,
    indentUnit.of(" ".repeat(tabSize)),
    yamlFrontmatter({
      content: markdown({
        codeLanguages: [
          LanguageDescription.of({
            name: "javascript",
            alias: ["js"],
            extensions: [".js", ".cjs", ".mjs"],
            support: new LanguageSupport(javascriptLanguage),
          }),
        ],
        extensions: [markdownHandlebars],
      }),
    }),
  ];

  useEffect(() => {
    load().then(({ source, fileAssets }) => {
      const assetList = Object.entries(fileAssets).map(([alias, file]) => ({
        alias,
        file,
        readonly: true,
      }));
      setSource(source);
      setAssetList(assetList);
    });
  }, []);

  const handleInputAssetsChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const target = ev.currentTarget;
    if (!target.files) {
      return;
    }
    const newAssets = Array.from(target.files).map((file): AssetEntry => ({ alias: file.name, file, readonly: true }));
    setAssetList(
      produce((draft) => {
        draft.push(...newAssets);
      })
    );
    target.value = "";
  };

  const handleInputAliasDoubleClick = (i: number) => {
    setAssetList(
      produce((draft) => {
        draft[i].readonly = false;
      })
    );
  };

  const handleInputAliasKeyDown = (i: number, ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Enter") {
      setAssetList(
        produce((draft) => {
          draft[i].readonly = true;
        })
      );
    }
  };

  const handleInputAliasBlur = (i: number) => {
    setAssetList(
      produce((draft) => {
        draft[i].readonly = true;
      })
    );
  };

  const handleInputAliasChange = (i: number, ev: ChangeEvent<HTMLInputElement>) => {
    const value = ev.currentTarget.value;
    setAssetList(
      produce((draft) => {
        draft[i].alias = value;
      })
    );
  };

  const handleButtonDeleteClick = (i: number) => {
    setAssetList(
      produce((draft) => {
        draft.splice(i, 1);
      })
    );
  };

  const handleInputArchiveChange = async (ev: ChangeEvent<HTMLInputElement>) => {
    const target = ev.currentTarget;
    const file = target.files?.[0];
    if (!file) {
      return;
    }
    const { source, fileAssets } = await decompress(file);
    const assetList = Object.entries(fileAssets).map(([alias, file]) => ({
      alias,
      file,
      readonly: true,
    }));
    setSource(source);
    setAssetList(assetList);
    target.value = "";
  };

  const handleButtonDownloadClick = async () => {
    const anchor = anchorArchive.current!;
    const fileAssets = Object.fromEntries(assetList.map(({ alias, file }) => [alias, file]));
    const archive = await compress({ source, fileAssets });
    const objectUrl = URL.createObjectURL(archive);
    anchor.href = objectUrl;
    anchor.download = "download.zip";
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleButtonPreviewClick = async () => {
    const fileAssets = Object.fromEntries(assetList.map(({ alias, file }) => [alias, file]));
    await save({ source: sourceRef.current, fileAssets });
    window.open("/preview/", "_blank");
  };

  return (
    <div className="w-screen h-screen p-4 flex flex-col">
      <h1 className="mb-4 text-3xl text-center">Source Editor</h1>
      <div className="grow flex gap-2 flex-col sm:flex-row overflow-hidden">
        <div className="sm:grow-[1] sm:basis-0 sm:min-w-64 flex flex-col">
          <label className="peer">
            <div className="px-2 py-1 flex justify-between has-[:checked]:border-b-2 sm:border-none border-red-700">
              <input className="peer hidden" type="checkbox" />
              <span>Assets</span>
              <input className="hidden" ref={inputAssets} type="file" multiple onChange={handleInputAssetsChange} />
              <button
                className="button-text peer-checked:hidden peer-checked:sm:block"
                type="button"
                onClick={() => inputAssets.current!.click()}
              >
                Upload
              </button>
            </div>
          </label>
          <div className="peer-has-[:checked]:hidden peer-has-[:checked]:sm:block sm:grow px-2 py-2 h-32 border-2 border-red-700 space-y-2 overflow-auto">
            {assetList.map(({ alias, file, readonly }, i) => {
              return (
                <div key={i} className="flex gap-2 text-sm">
                  <input
                    className="grow basis-0 min-w-0 px-1 border-b border-red-700 read-only:bg-red-100"
                    type="text"
                    value={alias}
                    readOnly={readonly}
                    onDoubleClick={() => handleInputAliasDoubleClick(i)}
                    onKeyDown={(ev) => handleInputAliasKeyDown(i, ev)}
                    onBlur={() => handleInputAliasBlur(i)}
                    onChange={(ev) => handleInputAliasChange(i, ev)}
                  />
                  <div className="grow basis-0 min-w-0 text-gray-500 overflow-hidden overflow-ellipsis text-nowrap">
                    {file.name}
                  </div>
                  <button className="button-text" onClick={() => handleButtonDeleteClick(i)}>
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div className="grow-[3] basis-0 flex flex-col overflow-hidden">
          <div className="px-2 py-1 flex justify-between">
            <label>
              <span>Tab Size</span>
              <select
                className="w-16 text-center cursor-pointer"
                value={tabSize}
                onChange={(ev) => setTabSize(parseInt(ev.currentTarget.value))}
              >
                {tabSizeOptions.map((value, i) => (
                  <option key={i} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <input ref={inputArchive} className="hidden" type="file" onChange={handleInputArchiveChange} />
              <button className="button-text" type="button" onClick={() => inputArchive.current!.click()}>
                Upload
              </button>
              <a ref={anchorArchive} className="hidden"></a>
              <button className="button-text" type="button" onClick={handleButtonDownloadClick}>
                Download
              </button>
              <button className="button-text" type="button" onClick={handleButtonPreviewClick}>
                Preview
              </button>
            </div>
          </div>
          <div className="relative grow border-2 border-red-700 text-sm resize-none overflow-hidden">
            <CodeMirror
              className="w-full h-full"
              width="100%"
              height="100%"
              extensions={extensions}
              value={source}
              onChange={(value) => (sourceRef.current = value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
