<script setup lang="ts">
    const props = defineProps<{
        msg: MessageWrapper,
    }>()
    import { fromNano } from '@ton/core';
    import { computed } from 'vue';
    import type { MessageWrapper } from '@/stores/txParser';
    import { storeToRefs } from 'pinia';
    import { encodeAddress } from '@polkadot/util-crypto';
    import InfoItem from './InfoItem.vue';
    import { useTonClient } from '@/stores/tonClient';
    import { CHAIN } from '@tonconnect/ui';

    const { chain } = storeToRefs(useTonClient());
    
    function bytes32ToSoraAddress(address: bigint) {
        try {
            return encodeAddress('0x' + address.toString(16).padStart(64, '0'), 69);
        } catch (e) {
            return `Wrong address: ${e}`;
        }
    }

    const msgType = computed(() => props.msg.type[0].toUpperCase() + props.msg.type.substring(1));
    const details = computed(() => props.msg.details);
</script>

<template>
    <VListItem>
        <VListItemTitle>
            {{ msgType }} message ({{ msg.details?.$$type ?? 'unknown' }}) 
        </VListItemTitle>
        <VListItemSubtitle>
            <InfoItem name="Source" :value="msg.src ?? 'unknown'"/>
            <InfoItem name="Dest" :value="msg.dest ?? 'unknown'"/>
        </VListItemSubtitle>
        <VListItemSubtitle v-if="msg.type === 'internal'">
            <InfoItem name="Value" :value="fromNano(msg.value)"/>
        </VListItemSubtitle>
        <div v-if="details">
            <VListItemSubtitle v-if="details.$$type == 'SendTon'">
                <InfoItem name="SORA Address" :value="bytes32ToSoraAddress(details.soraAddress.data)" :copy="true"/>
                <InfoItem name="Amount" :value="fromNano(details.amount)"/>
            </VListItemSubtitle>
            <VListItemSubtitle v-if="details.$$type == 'Migrate'">
                <InfoItem name="Receiver" :value="details.receiver.toString({testOnly: chain === CHAIN.TESTNET})" :copy="true"/>
            </VListItemSubtitle>
            <VListItemSubtitle v-if="details.$$type == 'SendInboundMessage'">
                <InfoItem name="Target" :value="details.target.toString({testOnly: chain === CHAIN.TESTNET})" :copy="true"/>
            </VListItemSubtitle>
            <VListItemSubtitle v-if="details.$$type == 'SendOutboundMessage'">
                <InfoItem name="Sender" :value="details.sender.toString({testOnly: chain === CHAIN.TESTNET})" :copy="true"/>
                <InfoItem class="text-truncate" name="Message" :value="details.message.data.bits.toString()" :copy="true"/>
            </VListItemSubtitle>
        </div>
    </VListItem>
</template>
