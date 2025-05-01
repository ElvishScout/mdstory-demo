import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { hbsInline } from "./extension";

export const theme = createTheme({
  theme: "light",
  settings: {
    background: "var(--color-white)",
    lineHighlight: "var(--color-transparent)",
    gutterBackground: "var(--color-gray-50)",
    gutterForeground: "var(--color-gray-500)",
    fontFamily: "var(--font-mono)",
    selection: "var(--color-red-100)",
  },
  styles: [
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
    { tag: t.heading1, color: "var(--color-red-700)", borderBottom: "3px double", fontWeight: "bold" },
    { tag: t.heading2, color: "var(--color-yellow-600)", borderBottom: "1px solid", fontWeight: "bold" },
    { tag: t.heading3, color: "var(--color-green-600)", fontWeight: "bold" },
    { tag: t.heading4, color: "var(--color-blue-600)", fontWeight: "bold" },
    { tag: t.heading, color: "var(--color-gray-500)", fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.link, color: "var(--color-blue-800)", textDecoration: "underline" },
    { tag: t.monospace, color: "var(--color-cyan-600)" },
    { tag: t.quote, color: "var(--color-gray-600)" },
    { tag: hbsInline, color: "var(--color-yellow-600)" },
  ],
});
