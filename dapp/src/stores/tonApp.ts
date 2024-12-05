import { Address, Cell, Message } from "@ton/core";
import { computed, ref, watch } from "vue";
import { useTonClient } from "./tonClient";
import { Deploy, loadDeploy, loadMigrate, loadSendTon, Migrate, SendTon, TonApp, loadMigrateInternal, MigrateInternal } from "@/contracts/TonApp";
import { defineStore, storeToRefs } from "pinia";
import { useIntervalFn } from "@vueuse/core";
import { CHAIN } from "@tonconnect/ui";
import {
    loadOutboundMessage, loadSendInboundMessage, loadSendOutboundMessage,
    OutboundMessage, SendInboundMessage, SendOutboundMessage, loadMigrate as channelLoadMigrate, Migrate as ChannelMigrate, loadMigrateInternal as channelLoadMigrateInternal, MigrateInternal as ChannelMigrateInternal
} from "@/contracts/Channel";
import { parseTransaction, TransactionWrapper } from "./txParser";

export const useTonApp = defineStore('tonApp', () => {
    const appAddressString = ref(import.meta.env.VITE_TON_APP_ADDRESS);
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
        const contract = TonApp.fromAddress(appAddress.value);
        return client.value.open(contract);
    });
    const lockedAmount = ref<bigint>();
    const balance = ref<bigint>();
    const owner = ref<Address>();
    const stopped = ref<boolean>();
    const transactions = ref<TransactionWrapper[]>();
    var loading = false;
    const updateState = async () => {
        if (loading) return;
        loading = true;
        lockedAmount.value = await contract.value?.getLockedAmount();
        owner.value = await contract.value?.getOwner();
        stopped.value = await contract.value?.getIsStopped();
        balance.value = appAddress.value && (await client.value?.getBalance(appAddress.value));
        loading = false;
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
    watch(balance, () => {
        updateTxs();
    });
    useIntervalFn(updateState, 6000);
    return {
        contract, appAddress, appAddressString, lockedAmount, balance, owner, stopped, transactions
    };
})
