<script setup lang="ts">
  import { computed } from 'vue';
  import TonConnectButton from './TonConnectButton.vue';
  import { CHAIN } from '@tonconnect/ui';
  import { useTonConnect } from '@/stores/tonConnect';
  import { storeToRefs } from 'pinia';
  const { chain } = storeToRefs(useTonConnect());
  import logo from '@/assets/logo.svg';
  const title = import.meta.env.VITE_APP_TITLE;
</script>

<template>
  <VAppBar>
      <VIcon class="ml-4" size="large">
        <img :src="logo" alt="Logo" />
      </VIcon>
    <VAppBarTitle>
        {{ title }}
    </VAppBarTitle>
    <div v-if="!chain">
      <VChip>
        Not connected
      </VChip>
    </div>
    <div v-else>
      <VChip :color="chain == CHAIN.MAINNET ? 'green': 'red'" variant="flat">
        Connected: {{ chain == CHAIN.MAINNET ? 'Mainnet' : 'Testnet' }}
      </VChip>
    </div>
    <VSpacer/>
      <TonConnectButton/>
  </VAppBar>
</template>
  