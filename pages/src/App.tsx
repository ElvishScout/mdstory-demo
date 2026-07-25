import { useRef, useState, useEffect, useCallback, ChangeEvent, KeyboardEvent, SyntheticEvent } from "react";
import { produce } from "immer";
import { LanguageDescription, LanguageSupport, indentUnit } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { yamlFrontmatter } from "@codemirror/lang-yaml";
import { javascriptLanguage } from "@codemirror/lang-javascript";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";

import { save, load } from "@/pages/lib/save-load";
import { compress, decompress } from "@/pages/lib/zip";
import { theme, highlight } from "./theme";
import { markdownHandlebars } from "./extension";
import { buildPreview, PreviewResult } from "./preview";

type AssetEntry = {
  alias: string;
  file: File;
};

const toValidIdentifier = (name: string) => {
  const identifier = name
    .replace(/\.[^.]+$/, "")
    .replace(/[-+*/\\%^&|~=!?<>()[\]{}'"`;:,.@#$\s]/g, "_")
    .replace(/^(\p{N})/u, "_$1");
  return identifier || "asset";
};

export default function App() {
  const tabSizeOptions = [1, 2, 3, 4, 5, 6, 7, 8];

  const inputAssets = useRef<HTMLInputElement>(null);
  const inputArchive = useRef<HTMLInputElement>(null);
  const anchorArchive = useRef<HTMLAnchorElement>(null);
  const sourceRef = useRef("");
  const buildSeq = useRef(0);
  const viewRef = useRef<EditorView | null>(null);
  const assetListRef = useRef<AssetEntry[]>([]);

  const [assetList, setAssetList] = useState<AssetEntry[]>([]);
  const [editingAlias, setEditingAlias] = useState<number | null>(null);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [tabSize, setTabSize] = useState(2);
  const [wrapText, setWrapText] = useState(true);
  const [source, setSource] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [previewStale, setPreviewStale] = useState(true);

  const addAssetFiles = (files: File[]): AssetEntry[] => {
    const used = new Set(assetListRef.current.map((entry) => entry.alias));
    const newAssets = files.map((file): AssetEntry => {
      let alias = toValidIdentifier(file.name);
      if (used.has(alias)) {
        let suffix = 2;
        while (used.has(`${alias}_${suffix}`)) {
          suffix++;
        }
        alias = `${alias}_${suffix}`;
      }
      used.add(alias);
      return { alias, file };
    });
    const next = [...assetListRef.current, ...newAssets];
    assetListRef.current = next;
    setAssetList(next);
    return newAssets;
  };

  const insertAssetEmbeds = (files: File[], pos: number | null) => {
    const view = viewRef.current;
    if (!view || files.length === 0) {
      return;
    }
    const newAssets = addAssetFiles(files);
    const text = newAssets.map(({ alias }) => `{{embed ${alias}}}`).join("\n");
    const at = pos ?? view.state.selection.main.head;
    view.dispatch({
      changes: { from: at, insert: text },
      selection: { anchor: at + text.length },
    });
    view.focus();
  };

  const extensions = [
    theme,
    highlight,
    indentUnit.of(" ".repeat(tabSize)),
    wrapText ? EditorView.lineWrapping : [],
    EditorView.domEventHandlers({
      drop(event, view) {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (files.length === 0) {
          return;
        }
        event.preventDefault();
        insertAssetEmbeds(files, view.posAtCoords({ x: event.clientX, y: event.clientY }));
        return true;
      },
      paste(event, view) {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (files.length === 0) {
          return;
        }
        event.preventDefault();
        insertAssetEmbeds(files, view.state.selection.main.head);
        return true;
      },
    }),
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
      }));
      sourceRef.current = source;
      setSource(source);
      setAssetList(assetList);
    });
  }, []);

  // Keep a synchronous mirror of the asset list for handlers that run
  // outside React's render cycle (editor drop/paste).
  useEffect(() => {
    assetListRef.current = assetList;
  }, [assetList]);

  const refreshPreview = useCallback(async () => {
    const seq = ++buildSeq.current;
    const fileAssets = Object.fromEntries(assetList.map(({ alias, file }) => [alias, file]));

    if (sourceRef.current.trim() === "") {
      setPreview(null);
      setPreviewError("");
      setPreviewStale(false);
      void save({ source: sourceRef.current, fileAssets });
      return;
    }

    try {
      const result = await buildPreview(sourceRef.current, fileAssets);
      if (seq !== buildSeq.current) {
        for (const url of result.urls) {
          URL.revokeObjectURL(url);
        }
        return;
      }
      setPreview((old) => {
        if (old) {
          for (const url of old.urls) {
            URL.revokeObjectURL(url);
          }
        }
        return result;
      });
      setPreviewError("");
    } catch (err) {
      if (seq === buildSeq.current) {
        setPreviewError("Error: " + (err instanceof Error ? err.message : String(err)));
      }
    } finally {
      if (seq === buildSeq.current) {
        setPreviewStale(false);
      }
    }
    void save({ source: sourceRef.current, fileAssets });
  }, [assetList]);

  // Rebuild the preview (debounced) whenever the source or assets change.
  useEffect(() => {
    setPreviewStale(true);
    const timer = setTimeout(() => void refreshPreview(), 800);
    return () => clearTimeout(timer);
  }, [source, assetList, refreshPreview]);

  const handleInputAssetsChange = (ev: ChangeEvent<HTMLInputElement>) => {
    const target = ev.currentTarget;
    if (!target.files) {
      return;
    }
    addAssetFiles(Array.from(target.files));
    target.value = "";
  };

  const handleInputAliasDoubleClick = (i: number) => {
    setEditingAlias(i);
  };

  const finalizeAlias = (i: number) => {
    setEditingAlias(null);
    setAssetList(
      produce((draft) => {
        const entry = draft[i];
        const taken = new Set(draft.filter((_, j) => j !== i).map((other) => other.alias));
        if (taken.has(entry.alias)) {
          let suffix = 2;
          while (taken.has(`${entry.alias}_${suffix}`)) {
            suffix++;
          }
          entry.alias = `${entry.alias}_${suffix}`;
        }
      }),
    );
  };

  const handleInputAliasKeyDown = (i: number, ev: KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === "Enter") {
      finalizeAlias(i);
    }
  };

  const handleInputAliasBlur = (i: number) => {
    finalizeAlias(i);
  };

  const handleInputAliasChange = (i: number, ev: ChangeEvent<HTMLInputElement>) => {
    const value = ev.currentTarget.value;
    setAssetList(
      produce((draft) => {
        draft[i].alias = value;
      }),
    );
  };

  const handleButtonDeleteClick = (i: number) => {
    setAssetList(
      produce((draft) => {
        draft.splice(i, 1);
      }),
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
    }));
    sourceRef.current = source;
    setSource(source);
    setAssetList(assetList);
    target.value = "";
  };

  const handleButtonDownloadClick = async () => {
    const anchor = anchorArchive.current!;
    const fileAssets = Object.fromEntries(assetList.map(({ alias, file }) => [alias, file]));
    const archive = await compress({ source: sourceRef.current, fileAssets });
    const objectUrl = URL.createObjectURL(archive);
    anchor.href = objectUrl;
    anchor.download = "download.zip";
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleIFrameLoad = (ev: SyntheticEvent<HTMLIFrameElement, Event>) => {
    const frameWindow = ev.currentTarget.contentWindow!;
    frameWindow.addEventListener("error", (ev) =>
      setPreviewError("Error: " + (ev.error instanceof Error ? ev.error.message : String(ev.error))),
    );
    frameWindow.addEventListener("unhandledrejection", (ev) =>
      setPreviewError("Error: " + (ev.reason instanceof Error ? ev.reason.message : String(ev.reason))),
    );
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-100 text-slate-800">
      <header className="shrink-0 h-12 px-4 flex items-center gap-2 bg-slate-900 text-white shadow-md z-10">
        <div className="flex items-center gap-2">
          <img className="w-5 h-5" src="/icon.png" alt="icon" />
          <h1 className="text-sm font-semibold tracking-wide">MDStory</h1>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <label className="flex items-center gap-1.5 px-2 text-xs text-slate-400">
            Tab
            <select
              className="bg-transparent text-slate-200 cursor-pointer"
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
          <button className="btn-dark" type="button" onClick={() => setWrapText((value) => !value)}>
            Wrap: {wrapText ? "On" : "Off"}
          </button>
          <span className="w-px h-4 mx-1 bg-white/15"></span>
          <input ref={inputArchive} className="hidden" type="file" onChange={handleInputArchiveChange} />
          <button className="btn-dark" type="button" onClick={() => inputArchive.current!.click()}>
            Open Zip
          </button>
          <a ref={anchorArchive} className="hidden"></a>
          <button className="btn-dark" type="button" onClick={handleButtonDownloadClick}>
            Save Zip
          </button>
          <a className="btn-dark" target="_blank" href={import.meta.env.VITE_GITHUB}>
            GitHub
          </a>
        </div>
      </header>

      <main className="grow flex flex-col md:flex-row overflow-hidden">
        <section className="md:w-1/2 h-1/2 md:h-auto flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-slate-200">
          <div className="shrink-0 px-3 h-9 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Source</span>
            <button className="btn-ghost" type="button" onClick={() => setAssetsOpen((value) => !value)}>
              Assets ({assetList.length}) {assetsOpen ? "▾" : "▸"}
            </button>
          </div>
          <div className="relative grow min-h-0 mx-3 mb-3 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden text-sm">
            <CodeMirror
              className="w-full h-full"
              width="100%"
              height="100%"
              extensions={extensions}
              value={source}
              onCreateEditor={(view) => {
                viewRef.current = view;
              }}
              onChange={(value) => {
                sourceRef.current = value;
                setSource(value);
              }}
            />
          </div>
          {assetsOpen && (
            <div className="shrink-0 mx-3 mb-3 max-h-48 overflow-auto panel">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-medium text-slate-500">Assets</span>
                <input className="hidden" ref={inputAssets} type="file" multiple onChange={handleInputAssetsChange} />
                <button className="btn-ghost" type="button" onClick={() => inputAssets.current!.click()}>
                  Upload
                </button>
              </div>
              {assetList.length === 0 ? (
                <p className="px-3 py-3 text-xs text-slate-400">No assets uploaded.</p>
              ) : (
                <ul className="p-2 space-y-1">
                  {assetList.map(({ alias, file }, i) => (
                    <li key={i} className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-slate-50">
                      <input
                        className={
                          "w-44 shrink-0 px-1.5 py-0.5 rounded border font-mono text-xs " +
                          (editingAlias === i ? "border-indigo-300 bg-white" : "border-transparent bg-transparent")
                        }
                        type="text"
                        value={alias}
                        readOnly={editingAlias !== i}
                        title="Double-click to rename"
                        onDoubleClick={() => handleInputAliasDoubleClick(i)}
                        onKeyDown={(ev) => handleInputAliasKeyDown(i, ev)}
                        onBlur={() => handleInputAliasBlur(i)}
                        onChange={(ev) => handleInputAliasChange(i, ev)}
                      />
                      <span className="grow min-w-0 truncate text-xs text-slate-400">{file.name}</span>
                      <button
                        className="shrink-0 w-6 h-6 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                        type="button"
                        title="Delete"
                        onClick={() => handleButtonDeleteClick(i)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        <section className="md:w-1/2 h-1/2 md:h-auto flex flex-col min-h-0">
          <div className="shrink-0 px-3 h-9 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
              Preview
              {previewStale && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>}
            </span>
            <div className="flex items-center gap-1">
              <button className="btn-ghost" type="button" onClick={() => void refreshPreview()}>
                Refresh
              </button>
              {preview && (
                <a className="btn-ghost" href={preview.downloadUrl} download={preview.downloadName}>
                  Export HTML
                </a>
              )}
            </div>
          </div>
          <div className="relative grow min-h-0 mx-3 mb-3 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            {preview ? (
              <iframe className="w-full h-full" src={preview.previewUrl} onLoad={handleIFrameLoad} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
                {previewStale ? "Building preview…" : "Start writing to see the preview."}
              </div>
            )}
            {previewError && (
              <div className="absolute inset-x-3 bottom-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs shadow-sm wrap-break-word">
                {previewError}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
