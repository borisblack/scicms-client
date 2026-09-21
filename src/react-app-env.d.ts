/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CORE_URL?: string
  readonly VITE_I18N_LNG?: string
  readonly DEV?: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
