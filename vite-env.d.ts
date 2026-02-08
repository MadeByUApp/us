// Fix: Removed missing vite/client reference
// /// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global type augmentations for Gemini API guidelines
declare var process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};

interface Window {
  aistudio?: {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  };
}
