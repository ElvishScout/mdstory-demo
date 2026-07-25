import { KeyValueStorage } from "./kvstore";

const kvStore = new KeyValueStorage();

export const save = async ({ source, fileAssets }: { source: string; fileAssets: Record<string, File> }) => {
  await kvStore.set("source", source);
  await kvStore.set("assets", fileAssets);
};

export const load = async () => {
  // null means nothing was ever stored; an empty string is real content.
  const source = await kvStore.get<string>("source");
  const fileAssets = (await kvStore.get<Record<string, File>>("assets")) ?? {};
  return { source, fileAssets };
};
