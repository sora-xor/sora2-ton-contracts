// This file is part of the SORA network and Polkaswap app.

// Copyright (c) 2020, 2021, Polka Biome Ltd. All rights reserved.
// SPDX-License-Identifier: BSD-4-Clause

// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:

// Redistributions of source code must retain the above copyright notice, this list
// of conditions and the following disclaimer.
// Redistributions in binary form must reproduce the above copyright notice, this
// list of conditions and the following disclaimer in the documentation and/or other
// materials provided with the distribution.
//
// All advertising materials mentioning features or use of this software must display
// the following acknowledgement: This product includes software developed by Polka Biome
// Ltd., SORA, and Polkaswap.
//
// Neither the name of the Polka Biome Ltd. nor the names of its contributors may be used
// to endorse or promote products derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY Polka Biome Ltd. AS IS AND ANY EXPRESS OR IMPLIED WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Polka Biome Ltd. BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
// USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

//! A collection of node-specific RPC methods.
//! Substrate provides the `sc-rpc` crate, which defines the core RPC layer
//! used by Substrate nodes. This file extends those RPC definitions with
//! capabilities that are specific to this project's runtime configuration.

import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, address, beginCell, Builder, toNano } from '@ton/core';
import { loadSendOutboundMessage, loadSendTon, TonApp } from '../wrappers/TonApp';
import '@ton/test-utils';
import assert from 'assert';
import { Channel } from '../wrappers/Channel';
import { JettonApp } from '../wrappers/JettonApp';
import { JettonAppWallet } from '../wrappers/JettonAppWallet';
import { SampleJetton } from '../wrappers/Jetton';
import { JettonDefaultWallet } from '../wrappers/JettonWallet';

describe('Bridge', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let jettonOwner: SandboxContract<TreasuryContract>;
    let channel: SandboxContract<Channel>;
    let tonApp: SandboxContract<TonApp>;
    let jetton: SandboxContract<SampleJetton>;
    let jettonWallet: SandboxContract<JettonDefaultWallet>;
    let jettonApp: SandboxContract<JettonApp>;
    let jettonAppWallet: SandboxContract<JettonAppWallet>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');

        jettonOwner = await blockchain.treasury('jettonOwner');

        channel = blockchain.openContract(await Channel.fromInit());

        tonApp = blockchain.openContract(await TonApp.fromInit(channel.address));

        jetton = blockchain.openContract(await SampleJetton.fromInit(jettonOwner.address, beginCell().storeStringTail("JettonSample").asCell(), toNano("1000")));

        jettonApp = blockchain.openContract(await JettonApp.fromInit(channel.address));

        jettonAppWallet = blockchain.openContract(await JettonAppWallet.fromInit(jettonApp.address, jetton.address));

        jettonWallet = blockchain.openContract(await JettonDefaultWallet.fromInit(jetton.address, jettonAppWallet.address));

        const channelDeployResult = await channel.send(
            deployer.getSender(),
            {
                value: toNano(1),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(channelDeployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            deploy: true,
            success: true,
        });


        const appDeployResult = await tonApp.send(
            deployer.getSender(),
            {
                value: toNano(1),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(appDeployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonApp.address,
            deploy: true,
            success: true,
        });

        const registerResult = await channel.send(
            deployer.getSender(),
            {
                value: toNano(1),
            },
            {
                $$type: 'RegisterApp',
                app: tonApp.address
            }
        );

        expect(registerResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            success: true,
        });

        assert(await channel.getIsApp(tonApp.address));

    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and soraApp are ready to use
    });

    it('should transfer', async () => {
        const sender = await blockchain.treasury("sender");
        console.log({
            sender: [sender.address, await sender.getBalance()],
            deployer: [deployer.address, await deployer.getBalance()],
            channel: [channel.address,
            (await blockchain.provider(channel.address).getState()).balance

            ],
            app: [tonApp.address,
            (await blockchain.provider(tonApp.address).getState()).balance]

        });
        const result = await tonApp.send(sender.getSender(), {
            value: toNano(2),
        },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt(14)
                },
                amount: toNano(1)
            }
        );
        console.log({
            sender: [sender.address, await sender.getBalance()],
            deployer: [deployer.address, await deployer.getBalance()],
            channel: [channel.address,
            (await blockchain.provider(channel.address).getState()).balance

            ],
            app: [tonApp.address,
            (await blockchain.provider(tonApp.address).getState()).balance]

        });
        assert(await channel.getOutboundNonce() == BigInt(1));
        assert(await tonApp.getLockedAmount() == toNano(1));
        const result2 = await tonApp.send(sender.getSender(), {
            value: toNano(2),
        },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt(14)
                },
                amount: toNano(1)
            }
        );
        console.log({
            sender: [sender.address, sender.address.toRawString(), await sender.getBalance()],
            deployer: [deployer.address, deployer.address.toRawString(), await deployer.getBalance()],
            channel: [channel.address, channel.address.toRawString(),
            (await blockchain.provider(channel.address).getState()).balance

            ],
            app: [tonApp.address, tonApp.address.toRawString(),
            (await blockchain.provider(tonApp.address).getState()).balance]

        });
        // console.log(result);
        // console.log(result2);
        assert(await channel.getOutboundNonce() == BigInt(2));
        assert(await tonApp.getLockedAmount() == toNano(2));
        const transfer = result.events[0];
        assert(transfer.type == "message_sent");
        const tonTransfer = loadSendTon(transfer.body.asSlice());
        assert(tonTransfer.amount == toNano(1));
        assert(tonTransfer.soraAddress.data == BigInt(14));
        const outboundEvent = result.events[1];
        assert(outboundEvent.type == "message_sent");
        const outboundMessage = loadSendOutboundMessage(outboundEvent.body.asSlice());
        assert(outboundMessage.sender.toString() == sender.address.toString());
        console.log(outboundMessage.message.data.bits.toString(), outboundMessage.message.data.bits.length);
        assert(outboundMessage.message.data.bits.toString() == "06000000000000000000000000000000000000000000000000000000000000000000000004004F0012472F2F564E18692F950888322B5075B3CFA32386AF7A84F3F84EE32418000000000000000000000000000000000000000000000000000000000000000E0000000000000000000000003B9ACA00");
    });

    it('should not transfer', async () => {
        const sender = await blockchain.treasury("sender");
        console.log({
            sender: (sender.address, await sender.getBalance()),
            deployer: (deployer.address, await deployer.getBalance()),
            channel: (channel.address,
                (await blockchain.provider(channel.address).getState()).balance

            ),
            app: (tonApp.address,
                (await blockchain.provider(tonApp.address).getState()).balance)

        });
        const result = await tonApp.send(sender.getSender(), {
            value: toNano(1),
        },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt(14)
                },
                amount: toNano(0.9999)
            }
        );
        console.log({
            sender: (sender.address, await sender.getBalance()),
            deployer: (deployer.address, await deployer.getBalance()),
            channel: (channel.address,
                (await blockchain.provider(channel.address).getState()).balance

            ),
            app: (tonApp.address,
                (await blockchain.provider(tonApp.address).getState()).balance)

        });
        assert(await channel.getOutboundNonce() == BigInt(0));
        assert(await tonApp.getLockedAmount() == BigInt(0));
        const transfer = result.events[0];
        assert(transfer.type == "message_sent");
        const tonTransfer = loadSendTon(transfer.body.asSlice());
        assert(tonTransfer.amount == toNano(0.9999));
        assert(tonTransfer.soraAddress.data == BigInt(14));
    });
});
