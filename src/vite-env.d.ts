/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAINBOWKIT_PROJECT_ID: string;
  readonly VITE_APP_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
