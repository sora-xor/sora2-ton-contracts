<script setup lang="ts">
  import PageBody from './components/PageBody.vue';
  import NavBar from './components/NavBar.vue';
  import { useTonConnect } from './stores/tonConnect';
  const { provide } = useTonConnect();
  provide({
    manifestUrl: "https://raw.githubusercontent.com/sora-xor/sora2-ton-contracts/refs/heads/updated-ton-contracts/dapp/public/tonconnect-manifest.json"
  });
</script>

<template>
  <VApp>
    <NavBar />
    <VMain>
        <PageBody />
    </VMain>
  </VApp>
</template>
