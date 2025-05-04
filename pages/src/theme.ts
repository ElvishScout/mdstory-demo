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
      backgroundColor: "var(--color-red-200) !important",
    },
    "& .cm-matchingBracket": {
      backgroundColor: "var(--color-amber-200) !important",
    },
    "& .cm-selectionMatch": {
      backgroundColor: "var(--color-green-200) !important",
    },
  },
  { dark: false }
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
    { tag: t.heading1, color: "var(--color-red-700)", borderBottom: "3px double", fontWeight: "bold" },
    { tag: t.heading2, color: "var(--color-yellow-600)", borderBottom: "1px solid", fontWeight: "bold" },
    { tag: t.heading3, color: "var(--color-green-600)", fontWeight: "bold" },
    { tag: t.heading4, color: "var(--color-blue-600)", fontWeight: "bold" },
    { tag: t.heading, color: "var(--color-gray-500)", fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.link, color: "var(--color-blue-800)", textDecoration: "underline" },
    { tag: t.quote, color: "var(--color-gray-600)" },
    { tag: t.monospace, color: "var(--color-cyan-600)" },
  ])
);

// createTheme({
//   theme: "light",
//   settings: {
//     background: "var(--color-white)",
//     lineHighlight: "var(--color-transparent)",
//     gutterBackground: "var(--color-gray-50)",
//     gutterForeground: "var(--color-gray-500)",
//     fontFamily: "var(--font-mono)",
//     selection: "var(--color-red-100)",
//   },
//   styles: [
//     // Code languages
//     { tag: t.monospace, color: "var(--color-cyan-600)" },
//     { tag: t.comment, color: "var(--color-green-600)" },
//     { tag: t.keyword, color: "var(--color-fuchsia-800)", fontWeight: "bold" },
//     { tag: t.string, color: "var(--color-red-700)" },
//     { tag: t.number, color: "var(--color-lime-700)" },
//     { tag: t.bool, color: "var(--color-blue-800)", fontWeight: "bold" },
//     { tag: t.null, color: "var(--color-blue-800)", fontWeight: "bold" },
//     { tag: t.propertyName, color: "var(--color-blue-800)" },
//     { tag: t.variableName, color: "var(--color-cyan-700)" },
//     { tag: t.regexp, color: "var(--color-red-600)" },
//     { tag: t.function(t.variableName), color: "var(--color-yellow-600)" },
//     { tag: t.className, color: "var(--color-green-600)" },
//     { tag: t.typeName, color: "var(--color-green-600)" },
//     { tag: t.operator, color: "var(--color-black)" },
//     { tag: t.tagName, color: "var(--color-blue-800)", fontWeight: "bold" },
//     { tag: t.attributeName, color: "var(--color-cyan-800)" },
//     { tag: hbsInline, color: "var(--color-yellow-600)" },
//     // Markdown
//     { tag: t.heading1, color: "var(--color-red-700)", borderBottom: "3px double", fontWeight: "bold" },
//     { tag: t.heading2, color: "var(--color-yellow-600)", borderBottom: "1px solid", fontWeight: "bold" },
//     { tag: t.heading3, color: "var(--color-green-600)", fontWeight: "bold" },
//     { tag: t.heading4, color: "var(--color-blue-600)", fontWeight: "bold" },
//     { tag: t.heading, color: "var(--color-gray-500)", fontWeight: "bold" },
//     { tag: t.emphasis, fontStyle: "italic" },
//     { tag: t.strong, fontWeight: "bold" },
//     { tag: t.link, color: "var(--color-blue-800)", textDecoration: "underline" },
//     { tag: t.quote, color: "var(--color-gray-600)" },
//   ],
// });
