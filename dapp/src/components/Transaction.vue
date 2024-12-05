<script setup lang="ts">
    const props = defineProps<{
        tx: TransactionWrapper,
        index: number
    }>()
    import { computed } from 'vue';
    import { storeToRefs } from 'pinia';
    import InfoItem from './InfoItem.vue';
    import { useTonClient } from '@/stores/tonClient';
    import { CHAIN } from '@tonconnect/ui';
    import Message from './Message.vue';
    import type { TransactionWrapper } from '@/stores/txParser';
import { fromNano } from '@ton/core';
    const { chain } = storeToRefs(useTonClient());
    
    function timestampToDate(now: number) {
        return (new Date(now * 1000)).toISOString();
    }

    const tonviewerBase = computed(() => chain.value === CHAIN.MAINNET ?
        'https://tonviewer.com/transaction/' :
        'https://testnet.tonviewer.com/transaction/');
</script>

<template>
    <VExpansionPanel>
        <VExpansionPanelTitle>
            <VContainer>
                <VRow justify="space-between">
                    <span>
                        {{ tx.inMessage?.details?.$$type ?? 'Unknown' }}
                    </span>
                    <a class="text-caption text-decoration-none" :href="tonviewerBase + tx.hash">{{ tx.hash }}</a>
                </VRow>
            </VContainer>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
            <InfoItem name="Date" :value="timestampToDate(tx.now)"/>
            <InfoItem name="Total fee" :value="fromNano(tx.totalFees)"/>
            <VList>
                <VListSubheader>Input message</VListSubheader>
                <Message v-if="tx.inMessage" :msg="tx.inMessage"/>
                <VDivider />
                <VListSubheader>Output messages</VListSubheader>
                <Message v-for="msg in tx.outMessages" :msg="msg"/>
            </VList>
        </VExpansionPanelText>
    </VExpansionPanel>
</template>
