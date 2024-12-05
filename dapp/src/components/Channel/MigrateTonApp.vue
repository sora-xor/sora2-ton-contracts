<script setup lang="ts">
    import { Address, beginCell, fromNano, toNano } from '@ton/core';
    import { computed, ref } from 'vue';
    import { useTonApp } from '@/stores/tonApp';
    import { storeToRefs } from 'pinia';
    import { useSender } from '@/stores/sender';
    import { decodeAddress } from '@polkadot/util-crypto';
    import { u8aToHex } from '@polkadot/util/u8a/toHexBuffer';
import { useChannel } from '@/stores/channel';
import { storeMigrate } from '@/contracts/TonApp';
import { useTonConnect } from '@/stores/tonConnect';
    const sendAddress = ref("");
    const sendAddressParsed = computed(() => {
        try {
            const address = Address.parseFriendly(sendAddress.value).address;
            return address;
        } catch (e) {
            console.log(`Failed to parse address: ${e}`);
            return;
        }
    });

    const {contract: tonApp, stopped} = storeToRefs(useTonApp());
    const {contract: channel, owner} = storeToRefs(useChannel());
    const { address } = storeToRefs(useTonConnect());
    const sender = useSender();

    const cantSendReason = computed(() => {
        if (stopped.value === true) return "TonApp stopped";
        if (!sendAddressParsed.value) return "Wrong address";
        if (!owner.value || !address.value || owner.value !== address.value) return "Is not Channel owner";
        return;
    });

    function migrateTonApp() {
        if (stopped.value || !sender.value || !sendAddressParsed.value || !channel.value || !tonApp.value) return;
        channel.value.send(sender.value, { value: toNano("0.1") }, {
            $$type: "SendInboundMessage",
            target: tonApp.value.address,
            message: beginCell().store(storeMigrate({
                $$type: "Migrate",
                receiver: sendAddressParsed.value
            })).asCell()
        });
    }
</script>

<template>
    <VExpansionPanel>
        <VExpansionPanelTitle>
            Migrate TON App
        </VExpansionPanelTitle>
        <VExpansionPanelText>
            <VCol>
                <VTextField variant="outlined" label="Address" v-model:model-value="sendAddress"></VTextField>
                <br/>
                <VRow justify="space-between">
                    <div v-if="cantSendReason">
                        <VChip color="red">
                            Can't send: {{ cantSendReason }}
                        </VChip>
                    </div>
                    <VSpacer/>
                    <VChip>
                        Required balance: 0.1
                    </VChip>
                </VRow>
                <div v-if="!cantSendReason">
                    <VBtn color="primary" variant="flat" @click="migrateTonApp()">Send</VBtn>
                </div>
            </VCol>
        </VExpansionPanelText>
    </VExpansionPanel>
</template>
