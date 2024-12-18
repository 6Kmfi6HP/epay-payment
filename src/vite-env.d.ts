/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MERCHANT_ID: string
  readonly VITE_MERCHANT_KEY: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
