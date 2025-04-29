import { zip, unzip, AsyncZippable, Unzipped } from "fflate";

type Manifest = {
  entry: string;
  assets: Record<string, { alias: string; name: string }>;
};

export const compress = async ({ source, fileAssets }: { source: string; fileAssets: Record<string, File> }) => {
  const entryPath = "story.md";
  const manifestPath = "manifest.json";
  const assetsDir = "assets";

  const manifest: Manifest = {
    entry: entryPath,
    assets: {},
  };
  const assets: Record<string, Uint8Array> = {};

  let count = 1;
  await Promise.all(
    Object.entries(fileAssets).map(async ([alias, file]) => {
      const id = count++;
      const data = await new Promise<Uint8Array>((resolve) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
          const data = new Uint8Array(fileReader.result as ArrayBuffer);
          resolve(data);
        };
        fileReader.readAsArrayBuffer(file);
      });
      manifest.assets[`${assetsDir}/${id}`] = { alias, name: file.name };
      assets[id] = data;
    })
  );

  const textEncoder = new TextEncoder();
  const structure: AsyncZippable = {
    [entryPath]: textEncoder.encode(source),
    [manifestPath]: textEncoder.encode(JSON.stringify(manifest, undefined, 2)),
    [assetsDir]: assets,
  };

  const archiveData = await new Promise<Uint8Array>((resolve, reject) => {
    zip(structure, {}, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });

  return new Blob([archiveData], { type: "application/zip" });
};

export const decompress = async (archive: File) => {
  const archiveData = await new Promise<Uint8Array>((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const archiveData = new Uint8Array(fileReader.result as ArrayBuffer);
      resolve(archiveData);
    };
    fileReader.readAsArrayBuffer(archive);
  });

  const unzipped = await new Promise<Unzipped>((resolve, reject) => {
    unzip(archiveData, (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });

  const textDecoder = new TextDecoder();
  const manifest = JSON.parse(textDecoder.decode(unzipped["manifest.json"])) as Manifest;

  const entryPath = manifest.entry;
  const assetsMap = manifest.assets;

  const source = textDecoder.decode(unzipped[entryPath]);
  const fileAssets = Object.fromEntries(
    Object.entries(assetsMap).map(([path, { alias, name }]) => {
      const fileData = unzipped[path];
      const file = new File([fileData], name);
      return [alias, file];
    })
  );
  return { source, fileAssets };
};
