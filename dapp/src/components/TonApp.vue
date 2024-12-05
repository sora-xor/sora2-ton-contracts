<script setup lang="ts">
    import { fromNano } from '@ton/core';
    import { computed } from 'vue';
    import InfoItem from './InfoItem.vue';
    import { useTonApp } from '@/stores/tonApp';
    import { storeToRefs } from 'pinia';
    import { CHAIN } from '@tonconnect/ui';
    import { useTonConnect } from '@/stores/tonConnect';
    import SendTon from './TonApp/SendTon.vue';
    import Transactions from './Transactions.vue';
    const {appAddress, appAddressString, owner, lockedAmount, balance, stopped, transactions} = storeToRefs(useTonApp());
    const { chain } = storeToRefs(useTonConnect());
    const ownerFriendly = computed(() => owner.value?.toString({
        testOnly: chain.value === CHAIN.TESTNET
    }));
</script>

<template>
    <VContainer>
        <VCard>
            <VCardTitle>
                TonApp
            </VCardTitle>
            <VCol>
                <VTextField label="Address" v-model:model-value="appAddressString" variant="outlined"></VTextField>
                <InfoItem name="Address(raw)" :value="appAddress?.toRawString()" :copy="true"/>
                <InfoItem name="Owner" :value="ownerFriendly" :copy="true" />
                <InfoItem name="Locked amount" :value="lockedAmount && fromNano(lockedAmount)" />
                <InfoItem name="Is Stopped" :value="stopped" />
                <InfoItem name="Balance" :value="balance && fromNano(balance)" />
                <VExpansionPanels elevation="10" bg-color="grey-darken-4">
                    <SendTon />
                    <Transactions v-if="transactions" :txs="transactions" />
                </VExpansionPanels>
            </VCol>
        </VCard>
    </VContainer>
</template>
