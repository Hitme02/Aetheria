/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_API_AUTH_BASE?: string
  readonly VITE_API_UPLOAD_BASE?: string
  readonly VITE_API_METADATA_BASE?: string
  readonly VITE_API_MINT_BASE?: string
  readonly VITE_API_VOTING_BASE?: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ALCHEMY_URL?: string
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta { readonly env: ImportMetaEnv }

