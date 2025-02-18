/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GOOGLE_CLIENT_ID: string
    readonly VITE_GOOGLE_CLIENT_SECRET: string
}

// Don't declare ImportMeta interface at all, 
// let Vite's built-in types handle it 