import { Address, toNano } from '@ton/core';
import { loadSendTon, TonApp } from '../wrappers/TonApp';
import { NetworkProvider } from '@ton/blueprint';
import { TonClient, TonClient4 } from '@ton/ton';
import { Buffer } from "buffer";
import { loadOutboundMessage } from '../wrappers/Channel';

export async function run(provider: NetworkProvider) {
    const api = provider.api() as TonClient;
    const address = Address.parseFriendly("kQAlDRlBIa5NI2sUxWuv11ozYr-9uLYdPYe4pZqz3Ene3JGr").address;
    // const txs = await api.getAccountTransactions(address);
    console.log(address);
    const txs = await api.getTransactions(address, {
        limit: 10,
        archival: true
    });
    for (var i = 0; i < txs.length; i++) {
        const tx = txs[i];
        const info = tx.inMessage!.info;
        console.log('Tx hash: ', tx.hash().toString('hex'));
        if (info.type == 'internal') {
            console.log(`Value: ${info.value.coins}`);
        }
        const sendTon = loadSendTon(tx.inMessage!.body.asSlice());
        console.log(`Amount: ${sendTon.amount}`);
        const desc = tx.description;
        if (desc.type == 'generic') {
            const comp = desc.computePhase!;
            if (comp.type == 'vm') {
                console.log(`Success: ${comp.success}, code: ${comp.exitCode}`);
            }
        }
        console.log('Total fees:', tx.totalFees.coins);
        console.log();
    }
    // const account = await api.getAccount(0, address);
    // console.log(account);
}