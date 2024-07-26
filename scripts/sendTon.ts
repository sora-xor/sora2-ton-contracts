import { Address, toNano } from '@ton/core';
import { TonApp } from '../wrappers/TonApp';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const api = provider.api();
    const soraApp = provider.open(TonApp.fromAddress(Address.parseFriendly("EQDZE0dpSKg-jxaLa95DV1O-tuzvogIZe0SHLfSS6buhENIR").address));
    await soraApp.send(provider.sender(), {
        value: toNano(0.2),
    },
        {
            $$type: "SendTon",
            soraAddress: {
                $$type: "Bytes32",
                data: BigInt(14)
            },
            amount: toNano(0.1)
        }
    );
}