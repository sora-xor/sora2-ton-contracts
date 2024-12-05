import { Address } from "@ton/core";
import { computed, ref, watch } from "vue";
import { useTonClient } from "./tonClient";
import { defineStore, storeToRefs } from "pinia";
import { Channel } from "@/contracts/Channel";
import { useIntervalFn } from "@vueuse/core";
import { parseTransaction, TransactionWrapper } from "./txParser";


export const useChannel = defineStore('channel', () => {
    const appAddressString = ref(import.meta.env.VITE_CHANNEL_ADDRESS);
    const appAddress = computed(() => {
        try {
            return Address.parseFriendly(appAddressString.value).address;
        } catch (e) {
            console.log("Failed to parse address");
            return undefined;
        }
    });
    const { client, chain } = storeToRefs(useTonClient());
    const contract = computed(() => {
        if (!appAddress.value || !client.value) return;
        const contract = Channel.fromAddress(appAddress.value);
        return client.value.open(contract);
    });
    const outboundNonce = ref<bigint>();
    const balance = ref<bigint>();
    const owner = ref<Address>();
    const transactions = ref<TransactionWrapper[]>();
    var loading = false;
    const updateState = async () => {
        try {
            if (loading) return;
            loading = true;
            outboundNonce.value = await contract.value?.getOutboundNonce();
            owner.value = await contract.value?.getOwner();
            balance.value = appAddress.value && (await client.value?.getBalance(appAddress.value));
            loading = false;
        } catch (e) {
            console.log("Failed to load Channel data: ", e);
            loading = false;
        }
    };
    var loadingTxs = false;
    const updateTxs = async () => {
        if (loadingTxs) return;
        loadingTxs = true;
        const txs = appAddress.value && (await client.value?.getTransactions(appAddress.value, { archival: true, limit: 10 }));
        const parsedTxs = txs?.map((tx) => parseTransaction(tx, chain.value));
        transactions.value = parsedTxs;
        loadingTxs = false;
    }
    watch(contract, () => {
        updateState();
    });
    watch(outboundNonce, () => {
        updateTxs();
    });
    useIntervalFn(updateState, 6000);
    return {
        contract, appAddress, appAddressString, outboundNonce, balance, owner, transactions
    };
})
