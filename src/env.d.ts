/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_GOOGLE_CLIENT_SECRET: string
    readonly MODE: 'development' | 'production'
    readonly BASE_URL: string
    readonly DEV: boolean
    readonly PROD: boolean
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 