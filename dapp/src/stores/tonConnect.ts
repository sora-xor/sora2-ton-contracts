import { CHAIN, TonConnectUI, TonConnectUiOptions, Wallet } from '@tonconnect/ui'
import { computed, ref } from 'vue'
import { TonConnectUiCreateOptions, } from '@tonconnect/ui'
import { defineStore } from 'pinia'
import { Address } from '@ton/core'

export function isClientSide(): boolean {
    return typeof window !== 'undefined'
}

export const useTonConnect = defineStore("ton-connect", () => {
    const tonConnect = ref<TonConnectUI>();
    const wallet = ref<Wallet>();

    function provide(options: TonConnectUiCreateOptions) {
        if (isClientSide() && !tonConnect.value) {
            console.log("Init TON Connect");
            tonConnect.value = new TonConnectUI(options);
            if (tonConnect.value.wallet) {
                wallet.value = tonConnect.value.wallet;
            }
            tonConnect.value.onStatusChange((value) => {
                if (value) {
                    wallet.value = value;
                } else {
                    wallet.value = undefined;
                }
            })
        }
    }

    function setOptions(options: TonConnectUiOptions) {
        if (tonConnect.value && isClientSide()) {
            tonConnect.value.uiOptions = options;
        }
    }

    const chain = computed(() => wallet.value?.account.chain);
    const addressRaw = computed(() => wallet.value?.account.address);
    const address = computed(() => addressRaw.value ? Address.parseRaw(addressRaw.value) : undefined);
    const addressFriendly = computed(() => address.value?.toString({ testOnly: chain.value === CHAIN.TESTNET }));

    return { tonConnect, wallet, provide, setOptions, chain, address, addressRaw, addressFriendly };
});
