import { Address, toNano } from '@ton/core';
import { SoraApp } from '../wrappers/SoraApp';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const api = provider.api();
    const soraApp = provider.open(SoraApp.fromAddress(Address.parseFriendly("EQAd7XM2ZRHRVZ1nxLIc2mF9bCj5iVSxmxoa5wpznBaXpk4x").address));
    await soraApp.send(provider.sender(), {
        value: toNano(0.1),
    },
        {
            $$type: "TONTransfer",
            soraAddress: {
                $$type: "Bytes32",
                data: BigInt(14)
            }
        }
    );
}