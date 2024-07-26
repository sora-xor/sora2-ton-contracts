import { Address, toNano } from '@ton/core';
import { loadOutboundMessage, TonApp } from '../wrappers/TonApp';
import { NetworkProvider } from '@ton/blueprint';
import { TonClient4 } from '@ton/ton';

export async function run(provider: NetworkProvider) {
    const api = provider.api() as TonClient4;
    const address = Address.parseFriendly("EQAdHwT0uvzVSBRkxlypUqfwhLwEADJugS8TdqAmgkOe").address;
    const txs = await api.getAccountTransactions(address, BigInt(23967369000001), Buffer.from("d3afe2e449ef5682efb024e2d60b69f9870e96e1a70656da44f6ab28558c4c4a", "hex"));
    console.log(txs);
    for (const tx of txs) {
        console.log(tx.tx.outMessagesCount);
        for (const [id, out] of tx.tx.outMessages) {
            console.log(out);
            const message = loadBridgeMessage(out.body.asSlice());
            console.log(message);
            const slice = message.message.data.beginParse();
            const call = slice.loadUint(16);
            console.log(call);
            slice.loadUint(5);
            const token = slice.loadAddress();
            slice.loadUint(5);
            const senderAddress = slice.loadAddress();
            const recipient = slice.loadBuffer(32);
            const amount = slice.loadUint(128);
            slice.endParse();
            console.log('======================Cell:=========================');
            console.log({
                call: call,
                token: token.toRawString(),
                tokenRaw: token.toRaw(),
                sender: senderAddress.toRawString(),
                senderRaw: senderAddress.toRaw(),
                recipient: recipient,
                amount: amount
            });

        }
    }
}