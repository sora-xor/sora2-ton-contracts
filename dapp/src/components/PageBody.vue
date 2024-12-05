<script setup lang="ts">
    import { storeToRefs } from 'pinia';
    import Account from './Account.vue';
    import Channel from './Channel.vue';
    import TonApp from './TonApp.vue';
    import { useTonConnect } from '@/stores/tonConnect';
    import { CHAIN } from '@tonconnect/ui';
    const { chain } = storeToRefs(useTonConnect());
    const isTestnet = !!import.meta.env.VITE_IS_TESTNET;
</script>

<template>
    <VContainer max-width="900px">
        <div v-if="!chain">
            <VCard>
                <VCardTitle>
                    Please connect wallet
                </VCardTitle>
            </VCard>
        </div>
        <div v-else-if="chain === CHAIN.MAINNET && isTestnet">
            <VCard>
                <VCardTitle>
                    Please connect Testnet wallet
                </VCardTitle>
            </VCard>
        </div>
        <div v-else-if="chain === CHAIN.TESTNET && !isTestnet">
            <VCard>
                <VCardTitle>
                    Please connect Mainnet wallet
                </VCardTitle>
            </VCard>
        </div>
        <div v-else>
            <VCol align-self="center">
                <Account />
                <TonApp />
                <Channel />
            </VCol>
        </div>
    </VContainer>
</template>
