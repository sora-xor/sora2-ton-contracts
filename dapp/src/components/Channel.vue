<script setup lang="ts">
    import { computed } from 'vue';
    import InfoItem from './InfoItem.vue';
    import { storeToRefs } from 'pinia';
    import { useChannel } from '@/stores/channel';
    import { useTonConnect } from '@/stores/tonConnect';
    import { CHAIN } from '@tonconnect/ui';
    import { fromNano } from '@ton/core';
    import MigrateTonApp from './Channel/MigrateTonApp.vue';
    import RemoveTonApp from './Channel/RemoveTonApp.vue';
    import RegisterTonApp from './Channel/RegisterTonApp.vue';
    import Transactions from './Transactions.vue';
    const {appAddress, appAddressString, outboundNonce, balance, owner, transactions} = storeToRefs(useChannel());
    const { chain } = storeToRefs(useTonConnect());
    const ownerFriendly = computed(() => owner.value?.toString({
        testOnly: chain.value === CHAIN.TESTNET
    }));
</script>

<template>
    <VContainer>
        <VCard>
            <VCardTitle>
                Channel
            </VCardTitle>
            <VCol>
                <VTextField label="Address" v-model:model-value="appAddressString" variant="outlined"></VTextField>
                <InfoItem name="Address(raw)" :value="appAddress && appAddress.toRawString()" :copy="true"/>
                <InfoItem name="Owner" :value="ownerFriendly" :copy="true" />
                <InfoItem name="Outbound nonce" :value="outboundNonce" />
                <InfoItem name="Balance" :value="balance && fromNano(balance)" />
                <VExpansionPanels elevation="10" bg-color="grey-darken-4">
                    <MigrateTonApp />
                    <RemoveTonApp />
                    <RegisterTonApp />
                    <Transactions v-if="transactions" :txs="transactions" />
                </VExpansionPanels>
            </VCol>
        </VCard>
    </VContainer>
</template>
