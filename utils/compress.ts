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

export async function compressAndEncode(inputBytes: Uint8Array) {
  const brotli = await loadBrotli();
  const compressed = brotli.compress(inputBytes, { quality: 11 });
  return toBase64Url(compressed);
}

export async function compressAndEncodeText(inputString: string) {
  const inputBytes = new TextEncoder().encode(inputString);
  return await compressAndEncode(inputBytes);
}

export async function decodeAndDecompress(base64UrlString: string) {
  const brotli = await loadBrotli();
  const compressed = fromBase64Url(base64UrlString);
  return brotli.decompress(compressed);
}

export async function decodeAndDecompressText(base64UrlString: string) {
  const decompressed = await decodeAndDecompress(base64UrlString);
  return new TextDecoder("utf-8", { fatal: true }).decode(decompressed);
}
