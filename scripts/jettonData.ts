import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { TonClient, TonClient4 } from '@ton/ton';
import { Buffer } from "buffer";
import { loadOutboundMessage } from '../wrappers/Channel';
import { parseTokenMetadataCell, SoraJetton } from '../wrappers/Jetton';

export async function run(provider: NetworkProvider) {
    const api = provider.api() as TonClient;
    const address = Address.parseFriendly("kQBGju6Zf8HMI6X8yTYSHuLXWb_bCE4YWss3z80EVzBvqRzf").address;
    const master = api.open(SoraJetton.fromAddress(address));
    const data = await master.getGetJettonData()
    const content = parseTokenMetadataCell(data.content);
    console.log(content);
}