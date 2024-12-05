import { SenderArguments } from "@ton/core";
import { computed } from "vue";
import { useTonConnect } from "./tonConnect";
import { storeToRefs } from "pinia";


export function useSender() {
    const { tonConnect } = storeToRefs(useTonConnect());
    return computed(() => {
        if (!tonConnect.value) return;
        return {
            send: async (args: SenderArguments) => {
                tonConnect.value?.sendTransaction({
                    messages: [
                        {
                            address: args.to.toString(),
                            amount: args.value.toString(),
                            payload: args.body?.toBoc().toString('base64'),
                        }
                    ],
                    validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes for approve
                });
            },
        };
    });
}