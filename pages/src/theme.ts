import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { hbsInline } from "./extension";

export const theme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--color-white)",
      color: "var(--color-slate-800)",
    },
    "&, & *": {
      fontFamily: "var(--font-mono)",
    },
    "&.cm-focused": {
      outline: "none",
    },
    "& .cm-content": {
      caretColor: "var(--color-indigo-600)",
    },
    "& .cm-cursor": {
      borderLeftColor: "var(--color-indigo-600)",
    },
    "& .cm-gutters": {
      color: "var(--color-slate-400)",
      backgroundColor: "var(--color-slate-50)",
      border: "none",
      borderRight: "1px solid var(--color-slate-200)",
    },
    "& .cm-lineNumbers .cm-gutterElement": {
      padding: "0 0.25em 0 0.75em",
      minWidth: "2em",
    },
    "& .cm-foldGutter .cm-gutterElement": {
      width: "0.75em",
      color: "var(--color-slate-400)",
    },
    "& .cm-activeLine": {
      backgroundColor: "color-mix(in oklab, var(--color-indigo-100) 35%, transparent)",
    },
    "& .cm-activeLineGutter": {
      backgroundColor: "color-mix(in oklab, var(--color-indigo-100) 60%, transparent)",
      color: "var(--color-slate-600)",
    },
    "& .cm-selectionBackground": {
      backgroundColor: "color-mix(in oklab, var(--color-indigo-500) 20%, transparent) !important",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "color-mix(in oklab, var(--color-indigo-500) 25%, transparent) !important",
    },
    "& .cm-matchingBracket": {
      backgroundColor: "color-mix(in oklab, var(--color-amber-400) 25%, transparent) !important",
      outline: "none",
    },
    "& .cm-selectionMatch": {
      backgroundColor: "color-mix(in oklab, var(--color-indigo-300) 30%, transparent) !important",
    },
  },
  { dark: false },
);

export const highlight = syntaxHighlighting(
  HighlightStyle.define([
    // Code languages
    { tag: t.comment, color: "var(--color-slate-400)", fontStyle: "italic" },
    { tag: t.keyword, color: "var(--color-violet-600)", fontWeight: "bold" },
    { tag: t.string, color: "var(--color-emerald-600)" },
    { tag: t.number, color: "var(--color-amber-600)" },
    { tag: t.bool, color: "var(--color-indigo-600)", fontWeight: "bold" },
    { tag: t.null, color: "var(--color-indigo-600)", fontWeight: "bold" },
    { tag: t.propertyName, color: "var(--color-sky-700)" },
    { tag: t.variableName, color: "var(--color-slate-800)" },
    { tag: t.regexp, color: "var(--color-rose-600)" },
    { tag: t.function(t.variableName), color: "var(--color-indigo-600)" },
    { tag: t.className, color: "var(--color-teal-600)" },
    { tag: t.typeName, color: "var(--color-teal-600)" },
    { tag: t.operator, color: "var(--color-slate-500)" },
    { tag: t.tagName, color: "var(--color-indigo-600)", fontWeight: "bold" },
    { tag: t.attributeName, color: "var(--color-sky-700)" },
    { tag: hbsInline, color: "var(--color-amber-600)" },
    // Markdown
    { tag: t.heading1, color: "var(--color-indigo-600)", fontSize: "1.5em", fontWeight: "bold" },
    { tag: t.heading2, color: "var(--color-rose-600)", fontSize: "1.3em", fontWeight: "bold" },
    { tag: t.heading3, color: "var(--color-amber-600)", fontSize: "1.2em", fontWeight: "bold" },
    { tag: t.heading4, color: "var(--color-emerald-600)", fontSize: "1.15em", fontWeight: "bold" },
    { tag: t.heading5, color: "var(--color-sky-600)", fontSize: "1.1em", fontWeight: "bold" },
    { tag: t.heading, color: "var(--color-slate-600)", fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.link, color: "var(--color-indigo-600)", textDecoration: "underline" },
    { tag: t.quote, color: "var(--color-slate-500)" },
    { tag: t.monospace, color: "var(--color-emerald-600)" },
  ]),
);
