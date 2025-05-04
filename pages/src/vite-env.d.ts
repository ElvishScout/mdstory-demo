/// <reference types="vite/client" />

interface ImportMetaEnv {
  VITE_GITHUB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
