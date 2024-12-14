/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_TON_APP_ADDRESS: string
    readonly VITE_CHANNEL_ADDRESS: string
    readonly VITE_MAINNET_API_KEY: string | undefined
    readonly VITE_TESTNET_API_KEY: string | undefined
    readonly VITE_APP_TITLE: string
    readonly VITE_IS_TESTNET: boolean | undefined
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}