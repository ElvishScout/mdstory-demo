import { BrotliWasmType } from "brotli-wasm";

const loadBrotli = (() => {
  let brotliPromise: Promise<BrotliWasmType> | null = null;
  return async () => {
    brotliPromise ??= (await import("brotli-wasm")).default;
    return brotliPromise;
  };
})();

function toBase64Url(uint8Array: Uint8Array) {
  const binaryString = String.fromCharCode(...uint8Array);
  const base64 = btoa(binaryString);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(base64Url: string) {
  const base64 = base64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(base64Url.length / 4) * 4, "=");
  const binaryString = atob(base64);
  return Uint8Array.from(Array.from(binaryString, (char) => char.charCodeAt(0)));
}

export async function compressAndEncode(inputString: string) {
  const brotli = await loadBrotli();
  const inputBytes = new TextEncoder().encode(inputString);
  const compressed = brotli.compress(inputBytes, { quality: 11 });
  const base64UrlString = toBase64Url(compressed);
  return base64UrlString;
}

export async function decodeAndDecompress(base64UrlString: string) {
  const brotli = await loadBrotli();
  const compressed = fromBase64Url(base64UrlString);
  const decompressed = brotli.decompress(compressed);
  const outputString = new TextDecoder("utf-8", { fatal: true }).decode(decompressed);
  return outputString;
}
