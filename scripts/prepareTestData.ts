import { Address, beginCell, Dictionary, toNano } from '@ton/core';
import { TonApp } from '../wrappers/TonApp';
import { NetworkProvider } from '@ton/blueprint';
import { Channel, InboundMessage, Signature, storeInboundMessage, storeSendInboundMessages, storeSignature } from '../wrappers/Channel';

export async function run() {
    var sigs = Dictionary.empty();
    for (var i = 0; i < 10; i++) {
        sigs.set(i, {
            $$type: "Signature",
            public_key: BigInt(i * 2),
            signature: beginCell().storeInt(i * 3, 256).storeInt(i * 4, 256).asSlice()
        });
    }
    var messages = Dictionary.empty();
    for (var i = 0; i < 5; i++) {
        messages.set(i, {
            $$type: "InboundMessage",
            target: Address.parseFriendly("EQDPrO3R-RvXIHv-ONN4qrdaTQ7h7UZfdydk3qqNb1b6WDZE").address,
            fee: BigInt(i * 11),
            data: beginCell().storeInt(i * 9, 32).endCell()
        });
    }
    const message = beginCell().store(storeSendInboundMessages(
        {
            $$type: "SendInboundMessages",
            commitment: {
                $$type: "Commitment",
                total_fee: 12n,
                nonce: 3n,
                messages: messages as Dictionary<number, InboundMessage>,

            },
            proof: {
                $$type: "CommitmentProof",
                sigs: sigs as Dictionary<number, Signature>
            }
        }

    )).asCell();
    console.log(message.toBoc().toString('hex'));
    console.log('Hash', message.hash().toString('hex'));
    {
        var vec = Dictionary.empty();
        for (var i = 0; i < 100; i++) {
            vec.set(i, i);
        }
        const vecCell = beginCell().storeDict(vec, Dictionary.Keys.Uint(16), Dictionary.Values.Uint(16)).endCell();
        console.log(vecCell.toBoc().toString('hex'));
        console.log('Hash', vecCell.hash().toString('hex'));
    }
    {
        var vec = Dictionary.empty();
        for (var i = 0; i < 10; i++) {
            vec.set(i, i);
        }
        const vecCell = beginCell().storeDict(vec, Dictionary.Keys.Uint(16), Dictionary.Values.Uint(16)).endCell();
        console.log(vecCell.toBoc().toString('hex'));
        console.log('Hash', vecCell.hash().toString('hex'));
    }
}