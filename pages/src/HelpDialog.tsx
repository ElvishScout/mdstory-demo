import { useEffect, ReactNode } from "react";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-1.5">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
    <div className="space-y-1.5 text-sm text-slate-700 leading-relaxed">{children}</div>
  </section>
);

const Code = ({ children }: { children: string }) => (
  <code className="px-1 py-0.5 rounded bg-slate-100 font-mono text-xs text-slate-800">{children}</code>
);

const Pre = ({ children }: { children: string }) => (
  <pre className="px-3 py-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto">
    {children}
  </pre>
);

export default function HelpDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-full flex flex-col rounded-xl bg-white shadow-xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="shrink-0 px-5 h-12 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Quick Reference</h2>
          <button
            className="w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
            type="button"
            title="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="grow min-h-0 overflow-y-auto px-5 py-4 space-y-6">
          <Section title="This App">
            <p>
              MDStory is a live editor for <strong>MdStory</strong> interactive stories. Write the story source
              on the left; the right pane rebuilds a playable preview automatically as you type (the amber dot
              means a rebuild is pending). <strong>Refresh</strong> forces a rebuild, and{" "}
              <strong>Export HTML</strong> downloads a standalone story file.
            </p>
            <p>
              Your work is saved locally in the browser. Use <strong>Save Zip</strong> / <strong>Open Zip</strong>{" "}
              to export or restore an archive containing the source and all assets.
            </p>
            <p>
              Manage files in the <strong>Assets</strong> panel: upload, double-click an alias to rename it, or
              delete entries. You can also <strong>drag &amp; drop or paste files directly into the editor</strong>{" "}
              — each file is added as an asset and <Code>{"{{embed alias}}"}</Code> is inserted at the drop point
              or cursor.
            </p>
          </Section>

          <Section title="Document Structure">
            <p>
              A story is one Markdown file. Headings (<Code>#</Code>, <Code>##</Code>, <Code>###</Code>…) create
              nested <strong>Sections</strong>; the content between a heading and the next heading is that
              Section's template. Always give Sections an explicit stable id with <Code>{"{#id}"}</Code> —
              navigation targets these ids, and ids must be unique among siblings.
            </p>
            <Pre>{`---
title: My Story
scope:
  name: Traveler
  flags: {}
---

# Chapter One {#chapter1}

## Forest {#forest}

Scene text…`}</Pre>
            <p>
              The YAML frontmatter sets the <Code>title</Code>, the root <Code>scope</Code> (global variables),
              and optional <Code>assets</Code>.
            </p>
          </Section>

          <Section title="Scope & Hooks">
            <p>
              Each Section has a layer of <strong>scope</strong>. Reading <Code>scope.key</Code> walks from the
              current Section up to the root and returns the first match. Writing{" "}
              <Code>scope.key = value</Code> updates the nearest ancestor that owns the key, otherwise it writes
              to the current layer.
            </p>
            <p>
              A Section's <Code>{"<script>"}</Code> tag may export three hooks. On every entry the Section's own
              scope is reset, then <Code>data()</Code> → <Code>onEnter()</Code> run; state that must survive
              re-entry belongs in an ancestor or the root scope. Note that values returned by{" "}
              <Code>data()</Code> always merge into the <em>current</em> layer, even if an ancestor defines the
              same key.
            </p>
            <Pre>{`<script>
export default {
  data() {
    return { difficulty: 3 };      // initialize this Section's variables
  },
  onEnter({ scope }) {
    scope.flags.entered = true;    // side effects on entry
  },
  onLeave({ scope, target }) {
    if (target === "dungeon.exit") // branch on where the reader is going
      scope.flags.cleared = true;
  },
};
</script>`}</Pre>
          </Section>

          <Section title="Navigation">
            <Pre>{`{{#nav "sibling"}}Go to a sibling section{{/nav}}
{{#nav "chapter1.forest"}}Multi-segment path{{/nav}}
{{#nav null}}The End{{/nav}}`}</Pre>
            <p>
              Paths resolve as absolute from the root first, then relative to the current Section, then by
              walking up the ancestors. Use <Code>null</Code> or <Code>""</Code> to end the story. If a Section
              contains no <Code>{"{{#nav}}"}</Code>, the story advances automatically in depth-first order.
              Navigating to the current Section re-enters it (scope resets).
            </p>
          </Section>

          <Section title="Reader Input">
            <Pre>{`{{input "string" name="Traveler"}}
{{input "number" age=18}}
{{input "boolean" brave=false}}`}</Pre>
            <p>
              Inputs are submitted together with the chosen <Code>{"{{#nav}}"}</Code> and written like{" "}
              <Code>scope.key = value</Code> before <Code>onLeave()</Code> runs, so{" "}
              <Code>onLeave</Code> can read the latest values.
            </p>
          </Section>

          <Section title="Template Syntax (Handlebars)">
            <Pre>{`Hello, {{name}}. You have {{gold}} coins.
{{{richHtml}}}            {{! raw HTML — beware XSS from reader input }}

{{#if hasKey}}
The door opens.
{{else if hasLockpick}}
You pick the lock.
{{else}}
The door is shut tight.
{{/if}}

{{#each inventory}}
- {{this}}
{{/each}}`}</Pre>
          </Section>

          <Section title="Built-in Helpers">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <Code>{"{{#nav target}}label{{/nav}}"}</Code> — navigation link
              </li>
              <li>
                <Code>{'{{input "type" key=default}}'}</Code> — reader input field
              </li>
              <li>
                <Code>{"{{linebreak N}}"}</Code> — insert N blank lines
              </li>
              <li>
                <Code>{'{{embed alias label="Caption"}}'}</Code> — render an asset inline (optional{" "}
                <Code>label</Code>, <Code>width</Code>, <Code>height</Code>)
              </li>
            </ul>
          </Section>

          <Section title="Assets">
            <p>
              Files added in the Assets panel are available by their alias — embed them with{" "}
              <Code>{"{{embed alias}}"}</Code>, or reference the URL directly in Markdown/HTML with{" "}
              <Code>{"{alias.url}"}</Code>. External assets can also be declared in the frontmatter:
            </p>
            <Pre>{`assets:
  map: "https://example.com/map.png"
  bgm: { url: "https://example.com/audio.mp3", mime: "audio/mpeg" }`}</Pre>
          </Section>

          <Section title="Include">
            <p>
              <Code>{'!include("./chapters/intro.md")'}</Code> splices another Markdown file (relative path,
              absolute path, or URL) into the current position. Includes inside an included file resolve
              relative to that file.
            </p>
          </Section>

          <Section title="Styles">
            <p>
              A <Code>{"<style>"}</Code> tag belongs to its Section and applies to that Section's rendered
              output.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
