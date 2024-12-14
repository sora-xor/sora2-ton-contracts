<script setup lang="ts">
    import InfoItem from './InfoItem.vue';
    import { computed } from 'vue';
    import { useTonClient } from '@/stores/tonClient';
    import { asyncComputed } from '@vueuse/core';
    import { Address, fromNano } from '@ton/core';
    import { useTonConnect } from '@/stores/tonConnect';
    import { CHAIN } from '@tonconnect/ui';
    import { storeToRefs } from 'pinia';
    const { wallet, chain, address, addressRaw, addressFriendly } = storeToRefs(useTonConnect());
    const chainName = computed(() => !chain.value ? 'Not connected' : (chain.value === CHAIN.MAINNET ? 'Mainnet' : 'Testnet'));
    const appName = computed(() => wallet.value && (wallet.value?.device.appName + ' ' + wallet.value?.device.appVersion));
    const {client} = storeToRefs(useTonClient());
    const balance = asyncComputed(async () => {
        if (!client.value || !address.value) return;
        const balance = await client.value?.getBalance(address.value);
        return balance;
    }, undefined);
</script>

<template>
    <VContainer>
        <VCard>
            <VCardTitle>
                Account
            </VCardTitle>
            <VCol>
                <InfoItem name="App" :value="appName"/>
                <InfoItem name="Chain" :value="chainName"/>
                <InfoItem name="Address" :value="addressFriendly" :copy="true"/>
                <InfoItem name="Address(raw)" :value="addressRaw" :copy="true"/>
                <InfoItem name="Balance" :value="balance && fromNano(balance)"/>
            </VCol>
        </VCard>
    </VContainer>
</template>
