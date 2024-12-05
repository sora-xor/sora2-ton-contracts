<script setup lang="ts">
    const props = defineProps([
        'name',
        'value',
        'copy'
    ]);
    import { useClipboard } from '@vueuse/core';
    import { FaCheck, FaCopy } from 'vue-icons-plus/fa';
    const { copy, copied, isSupported } = useClipboard();
</script>

<template>
    <div v-if="typeof props.value !== 'undefined'">
        <VCardText>
            <VRow justify="space-between">
                <p>{{ props.name }}</p>
                <VSpacer/>
                <p class="text-truncate text-end" style="max-width: 75%;">{{ props.value }}</p>
                <div v-if="props.copy === true && isSupported">
                    <VBtn size="x-small" @click="!copied ? copy(props.value): null">
                        <div v-if="copied">
                            <FaCheck size="12px"/>
                        </div>
                        <div v-else>
                            <FaCopy size="12px"/>
                        </div>
                    </VBtn>
                </div>
            </VRow>
        </VCardText>
    </div>
</template>