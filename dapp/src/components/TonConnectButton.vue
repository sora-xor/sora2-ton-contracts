<script setup lang="ts">
    defineOptions({
      name: 'TonConnectButton',
      inheritAttrs: false
    })
    import { onMounted } from "vue";
    import {useTonConnect} from "../stores/tonConnect";

    const {setOptions} = useTonConnect();
    const buttonRootId = 'ton-connect-button';

    export interface TonConnectButtonProps {
      className?: string;
    }
    defineProps<TonConnectButtonProps>()

    onMounted(() => {
      setOptions({
        buttonRootId: buttonRootId
      });
    })
</script>

<template>
  <VBtn>
    <div
        :id="buttonRootId"
        :class="className"
        :style="{
          width: 'fit-content',
        }">
    </div>
  </VBtn>
</template>