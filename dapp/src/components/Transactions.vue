<script setup lang="ts">
    defineProps<{
        txs: TransactionWrapper[]
    }>();
    import Transaction from './Transaction.vue';
    import type { TransactionWrapper } from '@/stores/txParser';
</script>

<template>
    <VExpansionPanel>
        <VExpansionPanelTitle>
            Latest Transactions
        </VExpansionPanelTitle>
        <VExpansionPanelText>
            <VExpansionPanels>
                <Transaction v-for="(tx, index) in txs" :tx="tx" :index="index"/>
            </VExpansionPanels>
        </VExpansionPanelText>
    </VExpansionPanel>
</template>
