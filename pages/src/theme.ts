// import { createTheme } from "@uiw/codemirror-themes";
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { hbsInline } from "./extension";

export const theme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--color-white)",
    },
    "&, & *": {
      fontFamily: "var(--font-mono)",
    },
    "&.cm-focused": {
      outline: "none",
    },
    "& .cm-gutter": {
      color: "var(--color-black)",
      backgroundColor: "var(--color-gray-100)",
    },
    "& .cm-lineNumbers .cm-gutterElement": {
      padding: "0 0.25em 0 0.75em",
      minWidth: "2em",
    },
    "& .cm-foldGutter .cm-gutterElement": {
      width: "0.75em",
    },
    "& .cm-activeLine": {
      backgroundColor: "transparent",
    },
    "& .cm-activeLineGutter": {
      backgroundColor: "transparent",
    },
    "& .cm-selectionBackground": {
      backgroundColor: "color-mix(in oklab, var(--color-red-500) 20%, transparent) !important",
    },
    "& .cm-matchingBracket": {
      backgroundColor: "color-mix(in oklab, var(--color-amber-500) 20%, transparent) !important",
    },
    "& .cm-selectionMatch": {
      backgroundColor: "color-mix(in oklab, var(--color-green-500) 20%, transparent) !important",
    },
  },
  { dark: false },
);

export const highlight = syntaxHighlighting(
  HighlightStyle.define([
    // Code languages
    { tag: t.comment, color: "var(--color-green-600)" },
    { tag: t.keyword, color: "var(--color-fuchsia-800)", fontWeight: "bold" },
    { tag: t.string, color: "var(--color-red-700)" },
    { tag: t.number, color: "var(--color-lime-700)" },
    { tag: t.bool, color: "var(--color-blue-800)", fontWeight: "bold" },
    { tag: t.null, color: "var(--color-blue-800)", fontWeight: "bold" },
    { tag: t.propertyName, color: "var(--color-blue-800)" },
    { tag: t.variableName, color: "var(--color-cyan-700)" },
    { tag: t.regexp, color: "var(--color-red-600)" },
    { tag: t.function(t.variableName), color: "var(--color-yellow-600)" },
    { tag: t.className, color: "var(--color-green-600)" },
    { tag: t.typeName, color: "var(--color-green-600)" },
    { tag: t.operator, color: "var(--color-black)" },
    { tag: t.tagName, color: "var(--color-blue-800)", fontWeight: "bold" },
    { tag: t.attributeName, color: "var(--color-cyan-800)" },
    { tag: hbsInline, color: "var(--color-yellow-600)" },
    // Markdown
    { tag: t.heading1, color: "var(--color-red-700)", fontSize: "1.5em", fontWeight: "bold" },
    { tag: t.heading2, color: "var(--color-yellow-600)", fontSize: "1.3em", fontWeight: "bold" },
    { tag: t.heading3, color: "var(--color-green-600)", fontSize: "1.2em", fontWeight: "bold" },
    { tag: t.heading4, color: "var(--color-blue-600)", fontSize: "1.15m", fontWeight: "bold" },
    { tag: t.heading5, color: "var(--color-purple-600)", fontSize: "1.1em", fontWeight: "bold" },
    { tag: t.heading, color: "var(--color-gray-600)", fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.link, color: "var(--color-blue-800)", textDecoration: "underline" },
    { tag: t.quote, color: "var(--color-gray-600)" },
    { tag: t.monospace, color: "var(--color-cyan-600)" },
  ]),
);
