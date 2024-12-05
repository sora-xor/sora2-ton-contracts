<script setup lang="ts">
    import { fromNano, toNano } from '@ton/core';
    import { computed, ref } from 'vue';
    import { useTonApp } from '@/stores/tonApp';
    import { storeToRefs } from 'pinia';
    import { useSender } from '@/stores/sender';
    import { decodeAddress } from '@polkadot/util-crypto';
    import { u8aToHex } from '@polkadot/util/u8a/toHexBuffer';
    const sendAmount = ref("0");
    const sendAddress = ref("");
    const sendAddressParsed = computed(() => {
        try {
            const address = decodeAddress(sendAddress.value)
            return BigInt(u8aToHex(address));
        } catch (e) {
            console.log(`Failed to parse address: ${e}`);
            return;
        }
    });
    const sendAmountParsed = computed(() => {
        try {
            return toNano(sendAmount.value);
        } catch (e) {
            console.log(`Failed to parse amount: ${e}`);
            return;
        }
    });

    const {contract} = storeToRefs(useTonApp());
    const sender = useSender();

    const cantSendReason = computed(() => {
        if (!contract.value) return "Not connected";
        if (!sendAddressParsed.value) return "Wrong address";
        if (sendAmountParsed.value === undefined) return "Wrong amount";
        if (sendAmountParsed.value === 0n) return "Zero amount";
        return;
    });

    function sendTon() {
        if (!contract.value || !sender.value || !sendAddressParsed.value || !sendAmountParsed.value) return;
        contract.value.send(sender.value, { value: sendAmountParsed.value + toNano("0.1") }, {
            $$type: "SendTon",
            amount: sendAmountParsed.value,
            soraAddress: {
                $$type: "Bytes32",
                data: sendAddressParsed.value
            }
        })
    }
</script>

<template>
    <VExpansionPanel>
        <VExpansionPanelTitle>
            Send TON
        </VExpansionPanelTitle>
        <VExpansionPanelText>
            <VCol>
                <VTextField variant="outlined" label="Amount" v-model:model-value="sendAmount"></VTextField>
                <VTextField variant="outlined" label="SORA Address" v-model:model-value="sendAddress"></VTextField>
                <VRow justify="space-between">
                    <div v-if="cantSendReason">
                        <VChip color="red">
                            Can't send: {{ cantSendReason }}
                        </VChip>
                    </div>
                    <VSpacer/>
                    <VChip>
                        Required balance: {{ fromNano((sendAmountParsed ?? 0n) + toNano("0.1")) }}
                    </VChip>
                </VRow>
                <div v-if="!cantSendReason">
                    <VBtn color="primary" variant="flat" @click="sendTon()">Send</VBtn>
                </div>
            </VCol>
        </VExpansionPanelText>
    </VExpansionPanel>
</template>
