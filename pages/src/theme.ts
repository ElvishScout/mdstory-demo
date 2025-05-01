import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

export const theme = createTheme({
  theme: "light",
  settings: {
    background: "var(--color-white)",
    lineHighlight: "var(--color-red-50)",
    gutterBackground: "var(--color-gray-50)",
    gutterForeground: "var(--color-gray-500)",
    fontFamily: "var(--font-mono)",
    selection: "var(--color-red-100)",
  },
  styles: [
    { tag: t.comment, color: "#008000" },
    { tag: t.keyword, color: "#0000FF" },
    { tag: t.string, color: "#A31515" },
    { tag: t.number, color: "#098658" },
    { tag: t.bool, color: "#0000FF" },
    { tag: t.null, color: "#0000FF" },
    { tag: t.variableName, color: "#001080" },
    { tag: t.definition(t.variableName), color: "#001080" },
    { tag: t.function(t.variableName), color: "#795E26" },
    { tag: t.className, color: "#267F99" },
    { tag: t.typeName, color: "#267F99" },
    { tag: t.operator, color: "#000000" },
    { tag: t.angleBracket, color: "#000000" },
    { tag: t.tagName, color: "#800000" },
    { tag: t.attributeName, color: "#FF0000" },
    { tag: t.brace, color: "#000000" },
  ],
});
