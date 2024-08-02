import { Address, toNano } from '@ton/core';
import { TonApp } from '../wrappers/TonApp';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const api = provider.api();
    const soraApp = provider.open(TonApp.fromAddress(Address.parseFriendly("EQDPrO3R-RvXIHv-ONN4qrdaTQ7h7UZfdydk3qqNb1b6WDZE").address));
    await soraApp.send(provider.sender(), {
        value: toNano(0.2),
    },
        {
            $$type: "SendTon",
            soraAddress: {
                $$type: "Bytes32",
                data: BigInt("0x74c7176f58d9b4da1d6d8e8347fbbd94715361e41333c53c6624e843e2bed77b")
            },
            amount: toNano(0.1)
        }
    );
}