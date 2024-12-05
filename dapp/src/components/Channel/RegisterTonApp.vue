<script setup lang="ts">
    import { toNano } from '@ton/core';
    import { computed } from 'vue';
    import { useTonApp } from '@/stores/tonApp';
    import { storeToRefs } from 'pinia';
    import { useSender } from '@/stores/sender';
    import { useChannel } from '@/stores/channel';
    import { computedAsync } from '@vueuse/core';
    import { useTonConnect } from '@/stores/tonConnect';
    const {contract: tonApp, stopped} = storeToRefs(useTonApp());
    const {contract: channel, owner} = storeToRefs(useChannel());
    const { address } = storeToRefs(useTonConnect());
    const sender = useSender();

    const registered = computedAsync(async () => {
        return tonApp.value && await channel.value?.getIsApp(tonApp.value?.address);

    });

    const cantSendReason = computed(() => {
        if (registered) return "App is registered";
        if (stopped.value === true) return "TonApp stopped";
        if (!owner.value || !address.value || owner.value !== address.value) return "Is not Channel owner";
        return;
    });

    function removeTonApp() {
        if (stopped.value || !registered || !sender.value || !channel.value || !tonApp.value) return;
        channel.value.send(sender.value, { value: toNano("0.1") }, {
            $$type: "RegisterApp",
            app: tonApp.value.address
        });
    }
</script>

<template>
    <VExpansionPanel>
        <VExpansionPanelTitle>
            Register TON App
        </VExpansionPanelTitle>
        <VExpansionPanelText>
            <VCol>
                <p>Register TON App in Channel</p>
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
                    <VBtn color="primary" variant="flat" @click="removeTonApp()">Send</VBtn>
                </div>
            </VCol>
        </VExpansionPanelText>
    </VExpansionPanel>
</template>
