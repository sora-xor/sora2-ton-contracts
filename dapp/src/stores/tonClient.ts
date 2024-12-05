import { defineStore, storeToRefs } from 'pinia'
import { computedAsync } from '@vueuse/core';
import { TonClient } from '@ton/ton';
import { useTonConnect } from './tonConnect';
import { CHAIN } from '@tonconnect/ui';

export const useTonClient = defineStore('tonClient', () => {
    const { chain } = storeToRefs(useTonConnect());
    const client = computedAsync(async () => {
        if (!chain.value) return;
        return new TonClient({
            endpoint: chain.value === CHAIN.MAINNET ? 'https://toncenter.com/api/v2/jsonRPC' : 'https://testnet.toncenter.com/api/v2/jsonRPC',
            apiKey: chain.value === CHAIN.MAINNET ? import.meta.env.VITE_MAINNET_API_KEY : import.meta.env.VITE_TESTNET_API_KEY
        });
    }, undefined);
    return { client, chain };
});
