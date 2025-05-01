import { MarkdownExtension } from "@lezer/markdown";
import { Tag } from "@lezer/highlight";

export const hbsInline = Tag.define("HandlebarsInline");

export const markdownHandlebars: MarkdownExtension = {
  defineNodes: [{ name: "HandlebarsInline", block: false, style: hbsInline }],
  parseInline: [
    {
      name: "HandlebarsInline",
      parse(cx, _, pos) {
        if (!(cx.char(pos) === 123 && cx.char(pos + 1) === 123)) {
          return -1;
        }
        let inline: string = "";
        const begin = pos;
        let quote: '"' | "'" | null = null;
        let escape = false;
        let endCount = 0;
        let i;
        for (i = begin; i < cx.end; i++) {
          const char = String.fromCharCode(cx.char(i));
          if (char === "\n") {
            break;
          }
          if (quote) {
            if (char === "\\") {
              escape = !escape;
            } else if (escape) {
              escape = false;
            } else if (char === '"' && quote === '"') {
              quote = null;
            } else if (char === "'" && quote === "'") {
              quote = null;
            }
          } else {
            if (char === "}") {
              endCount++;
            } else {
              if (endCount >= 2) {
                break;
              }
              if (char === '"' || char === "'") {
                quote = char;
              }
            }
          }
          inline += char;
        }
        if (quote || endCount < 2) {
          return -1;
        }

        let openBrace: { length: number; from: number } | null = null;
        let closeBrace: { length: number; from: number } | null = null;
        let regres: RegExpMatchArray | null;

        if ((regres = inline.match(/^{{2,}/))) {
          openBrace = { length: regres[0].length, from: begin };
        }
        if ((regres = inline.match(/}{2,}$/))) {
          closeBrace = { length: regres[0].length, from: begin + regres.index! };
        }
        if (!(openBrace && closeBrace)) {
          return -1;
        }
        const braceLength = Math.min(openBrace.length, closeBrace.length, 3);
        const start = openBrace.from + openBrace.length - braceLength;
        const stop = closeBrace.from + braceLength;
        return cx.addElement(cx.elt("HandlebarsInline", start, stop));
      },
    },
  ],
};
