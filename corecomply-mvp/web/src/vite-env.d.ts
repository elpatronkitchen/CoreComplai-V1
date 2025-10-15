/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_B2C_TENANT_NAME: string
  readonly VITE_B2C_CLIENT_ID: string
  readonly VITE_B2C_POLICY_SIGNIN: string
  readonly VITE_B2C_POLICY_RESET: string
  readonly VITE_B2C_POLICY_EDIT: string
  readonly VITE_API_SCOPE: string
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
