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

import { Blockchain, EventMessageSent, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, address, beginCell, Builder, toNano } from '@ton/core';
import { loadSendOutboundMessage, loadSendTon, TonApp } from '../wrappers/TonApp';
import '@ton/test-utils';
import assert from 'assert';
import { Channel, storeChangeOwner, storeMigrate, storeOutboundMessage, storeSendOutboundMessage } from '../wrappers/Channel';
import { TestChannel } from './TestChannel';

describe('TonApp', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let channel: TestChannel;
    let tonApp: SandboxContract<TonApp>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        channel = await TestChannel.fromInit(blockchain, deployer.address, 0n);
        await channel.deploy(deployer);

        tonApp = blockchain.openContract(await TonApp.fromInit(channel.address, 0n));


        const deployResult = await tonApp.send(
            deployer.getSender(),
            { value: toNano(1), },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: tonApp.address,
            deploy: true,
            success: true,
        });

        await channel.registerApp(deployer, tonApp.address, true, true);
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and soraApp are ready to use
    });

    it('should transfer', async () => {
        const sender = await blockchain.treasury("sender");
        const result = await tonApp.send(sender.getSender(),
            { value: toNano(2), },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
                },
                amount: toNano(1)
            }
        );
        expect(result.transactions).toHaveTransaction({
            from: sender.address,
            to: tonApp.address,
            deploy: false,
            success: true,
        });
        const bridgeCall = beginCell()
            .storeUint(0x0600, 16) // Transfer Bridge Call prefix (module: u8, call: u8)
            .storeUint(0, 16).storeUint(0, 256) // Zero address used to send TON to SORA (prefix: u8, workchain: u8, address: H256)
            .storeUint(0, 5).storeAddress(sender.address) // Address aligned to 34 bytes (prefix: u8, workchain: u8, address: H256)
            .storeUint(BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d"), 256) // Recipient (AccountId32)
            .storeUint(toNano(1), 128) // Amount (u128)
            .endCell();
        expect(result.transactions).toHaveTransaction({
            from: tonApp.address,
            to: channel.address,
            deploy: false,
            success: true,
            body: beginCell().store(storeSendOutboundMessage({
                $$type: "SendOutboundMessage",
                message: {
                    $$type: "SoraEncodedCall",
                    data: bridgeCall
                },
                sender: sender.address,

            })).endCell()
        });
        expect(result.transactions).toHaveTransaction({
            from: channel.address,
            to: sender.address,
            deploy: false,
            success: true,
        });
        expect(bridgeCall.bits.toString())
            .toEqual("06000000000000000000000000000000000000000000000000000000000000000000000004004F0012472F2F564E18692F950888322B5075B3CFA32386AF7A84F3F84EE32418D43593C715FDD31C61141ABD04A99FD6822C8558854CCDE39A5684E7A56DA27D0000000000000000000000003B9ACA00");
        const outbound = result.externals[0];
        expect(outbound.body).toEqualCell(beginCell().store(storeOutboundMessage({
            $$type: "OutboundMessage",
            message: {
                $$type: "SoraEncodedCall",
                data: bridgeCall
            },
            nonce: 1n,
            source: tonApp.address,
        })).asCell())
        expect(Number(await channel.getOutboundNonce())).toBe(1);
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
    });

    it('should not transfer with small value', async () => {
        const sender = await blockchain.treasury("sender");
        await tonApp.send(sender.getSender(),
            { value: toNano(2), },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
                },
                amount: toNano(1)
            }
        );
        expect(Number(await channel.getOutboundNonce())).toBe(1);
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
        const result = await tonApp.send(sender.getSender(),
            { value: toNano(1.04), },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
                },
                amount: toNano(1)
            }
        );
        expect(result.transactions).toHaveTransaction({
            from: sender.address,
            to: tonApp.address,
            deploy: false,
            success: false,
        });
        expect(result.transactions).toHaveTransaction({
            from: tonApp.address,
            to: sender.address,
            success: true,
            inMessageBounced: true
        });
        expect(Number(await channel.getOutboundNonce())).toBe(1);
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
    });

    it('should not transfer max amount', async () => {
        const sender = await blockchain.treasury("sender");
        await tonApp.send(sender.getSender(),
            { value: toNano(2), },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
                },
                amount: toNano(1)
            }
        );
        expect(Number(await channel.getOutboundNonce())).toBe(1);
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("1.01"));
        const result = await tonApp.send(sender.getSender(),
            { value: toNano(0.06), },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
                },
                amount: BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE") // u128::MAX - 1
            }
        );
        expect(result.transactions).toHaveTransaction({
            from: sender.address,
            to: tonApp.address,
            deploy: false,
            success: false,
        });
        expect(result.transactions).toHaveTransaction({
            from: tonApp.address,
            to: sender.address,
            success: true,
            inMessageBounced: true
        });
        expect(Number(await channel.getOutboundNonce())).toBe(1);
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
    });

    it('should migrate', async () => {
        const sender = await blockchain.treasury("sender");
        await tonApp.send(sender.getSender(),
            { value: toNano(2), },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
                },
                amount: toNano(1)
            }
        );
        expect(Number(await channel.getOutboundNonce())).toBe(1);
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
        const anotherApp = blockchain.openContract(await TonApp.fromInit(channel.address, 1n));
        const deployResult = await anotherApp.send(sender.getSender(), { value: toNano("1") }, { "$$type": "Deploy", queryId: 0n });
        expect(deployResult.transactions).toHaveTransaction({
            from: sender.address,
            to: anotherApp.address,
            deploy: true,
            success: true
        });
        const result = await channel.send(
            deployer.getSender(),
            { value: toNano("1") },
            {
                "$$type": "SendInboundMessage",
                target: tonApp.address,
                message: beginCell().store(storeMigrate(
                    {
                        $$type: "Migrate",
                        receiver: anotherApp.address
                    }

                )).endCell()
            });
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: channel.address,
            to: tonApp.address,
            success: true,
        });
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("0"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
        // Money used for migration is also transferred to App
        expect((await blockchain.provider(anotherApp.address).getState()).balance).toBeGreaterThanOrEqual(toNano("1.01"));
        expect(await anotherApp.getLockedAmount()).toBeGreaterThanOrEqual(toNano("1"));
    });

    it('should not migrate if not owner', async () => {
        const sender = await blockchain.treasury("sender");
        await tonApp.send(sender.getSender(),
            { value: toNano(2), },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
                },
                amount: toNano(1)
            }
        );
        expect(Number(await channel.getOutboundNonce())).toBe(1);
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
        const anotherApp = blockchain.openContract(await TonApp.fromInit(channel.address, 1n));
        const deployResult = await anotherApp.send(sender.getSender(), { value: toNano("1") }, { "$$type": "Deploy", queryId: 0n });
        expect(deployResult.transactions).toHaveTransaction({
            from: sender.address,
            to: anotherApp.address,
            deploy: true,
            success: true
        });
        const changeOwnerResult = await channel.send(
            deployer.getSender(),
            { value: toNano("1") },
            {
                "$$type": "SendInboundMessage",
                target: tonApp.address,
                message: beginCell().store(storeChangeOwner(
                    {
                        $$type: "ChangeOwner",
                        newOwner: sender.address,
                        queryId: 0n
                    }

                )).endCell()
            });
        expect(changeOwnerResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            success: true,
        });
        expect(changeOwnerResult.transactions).toHaveTransaction({
            from: channel.address,
            to: tonApp.address,
            success: true,
        });
        const result = await channel.send(
            deployer.getSender(),
            { value: toNano("1") },
            {
                "$$type": "SendInboundMessage",
                target: tonApp.address,
                message: beginCell().store(storeMigrate(
                    {
                        $$type: "Migrate",
                        receiver: anotherApp.address
                    }

                )).endCell()
            });
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: channel.address,
            to: tonApp.address,
            success: false,
        });
        expect((await blockchain.provider(tonApp.address).getState()).balance).toBeGreaterThanOrEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
        expect((await blockchain.provider(anotherApp.address).getState()).balance).toEqual(toNano("0"));
        expect(await anotherApp.getLockedAmount()).toEqual(toNano("0"));
    });

    it('should not migrate if failed', async () => {
        const sender = await blockchain.treasury("sender");
        await tonApp.send(sender.getSender(),
            { value: toNano(2), },
            {
                $$type: "SendTon",
                soraAddress: {
                    $$type: "Bytes32",
                    data: BigInt("0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d")
                },
                amount: toNano(1)
            }
        );
        expect(Number(await channel.getOutboundNonce())).toBe(1);
        expect((await blockchain.provider(tonApp.address).getState()).balance).toEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
        const anotherApp = blockchain.openContract(await TonApp.fromInit(channel.address, 1n));
        const deployResult = await anotherApp.send(sender.getSender(), { value: toNano("1") }, { "$$type": "Deploy", queryId: 0n });
        expect(deployResult.transactions).toHaveTransaction({
            from: sender.address,
            to: anotherApp.address,
            deploy: true,
            success: true
        });
        await channel.registerApp(deployer, anotherApp.address);
        const firstMigrate = await channel.send(
            deployer.getSender(),
            { value: toNano("1") },
            {
                "$$type": "SendInboundMessage",
                target: anotherApp.address,
                message: beginCell().store(storeMigrate(
                    {
                        $$type: "Migrate",
                        receiver: tonApp.address
                    }

                )).endCell()
            });
        expect(firstMigrate.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            success: true,
        });
        expect(firstMigrate.transactions).toHaveTransaction({
            from: channel.address,
            to: anotherApp.address,
            success: true,
        });
        expect(firstMigrate.transactions).toHaveTransaction({
            from: anotherApp.address,
            to: tonApp.address,
            success: true,
        });
        expect(await anotherApp.getIsStopped()).toBe(true);
        const result = await channel.send(
            deployer.getSender(),
            { value: toNano("1") },
            {
                "$$type": "SendInboundMessage",
                target: tonApp.address,
                message: beginCell().store(storeMigrate(
                    {
                        $$type: "Migrate",
                        receiver: anotherApp.address
                    }

                )).endCell()
            });
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: channel.address,
            to: tonApp.address,
            success: true,
        });
        expect(result.transactions).toHaveTransaction({
            from: tonApp.address,
            to: anotherApp.address,
            success: false,
        });
        expect(result.transactions).toHaveTransaction({
            from: anotherApp.address,
            to: tonApp.address,
            success: true,
            inMessageBounced: true
        });
        expect((await blockchain.provider(tonApp.address).getState()).balance).toBeGreaterThanOrEqual(toNano("1.01"));
        expect(await tonApp.getLockedAmount()).toEqual(toNano("1"));
        expect((await blockchain.provider(anotherApp.address).getState()).balance).toEqual(toNano("0"));
        expect(await anotherApp.getLockedAmount()).toEqual(toNano("0"));
        expect(await anotherApp.getIsStopped()).toBe(true);
        expect(await tonApp.getIsStopped()).toBe(false);
    });
});
