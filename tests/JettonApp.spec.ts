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
import { Address, address, beginCell, Builder, Cell, toNano } from '@ton/core';
import { loadSendOutboundMessage, JettonApp } from '../wrappers/JettonApp';
import { JettonAppWallet } from '../wrappers/JettonAppWallet';
import { JettonDefaultWallet } from '../wrappers/JettonWallet';
import { SampleJetton } from '../wrappers/Jetton';
import { Channel, loadOutboundMessage } from '../wrappers/Channel';
import '@ton/test-utils';
import assert from 'assert';

describe('TonApp', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    // let channel: SandboxContract<TreasuryContract>;
    let alice: SandboxContract<TreasuryContract>; // Jetton Master Admin
    let jettonApp: SandboxContract<JettonApp>;
    let channel: SandboxContract<Channel>;

    let usdtMaster: SandboxContract<SampleJetton>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        deployer = await blockchain.treasury('deployer');
        // channel = await blockchain.treasury('channel');
        alice = await blockchain.treasury('alice');

        let contentBuilder = beginCell()
        let content = contentBuilder.endCell();

        usdtMaster = blockchain.openContract(await SampleJetton.fromInit(alice.address, content, 100000000000n));
        jettonApp = blockchain.openContract(await JettonApp.fromInit(channel.address));
        channel = blockchain.openContract(await Channel.fromInit());

        const jettonAppDeployResult = await jettonApp.send(
            deployer.getSender(),
            {
                value: toNano(1),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        const jettonMasterDeployResult = await usdtMaster.send(
            alice.getSender(),
            {
                value: toNano(1),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

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

        expect(jettonAppDeployResult.transactions).toHaveTransaction({
            from: channel.address,
            to: jettonApp.address,
            deploy: true,
            success: true,
        });

        expect(jettonMasterDeployResult.transactions).toHaveTransaction({
            from: alice.address,
            to: usdtMaster.address,
            deploy: true,
            success: true,
        });

        expect(channelDeployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and jettonApp are ready to use
    });

    it('should register jetton', async () => {
        const someWallet = await blockchain.treasury("sender");
        const result = await jettonApp.send(deployer.getSender(), {
            value: toNano(2),
        },
            {
                $$type: "RegisterJetton",
                master: channel.address,
                wallet: someWallet.address,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonApp.address,
            success: true,
        });
    });

    it('should fail register jetton not owner', async () => {
        const someSender = await blockchain.treasury("sender");
        const result = await jettonApp.send(someSender.getSender(), {
            value: toNano(2),
        },
            {
                $$type: "RegisterJetton",
                master: deployer.address,
                wallet: someSender.address,
            }
        );

        expect(result.transactions).toHaveTransaction({
            from: someSender.address,
            to: jettonApp.address,
            success: false,
        });
    });

    it('should init jetton wallet', async () => {
        const soraUSDTWallet = await blockchain.treasury("sora usdt");
        const bob = await blockchain.treasury("bob");

        let soraUSDTTechAddress = await usdtMaster.getWalletAddress(soraUSDTWallet.address);

        const result = await jettonApp.send(deployer.getSender(), {
            value: toNano(2),
        },
            {
                $$type: "RegisterJetton",
                master: soraUSDTWallet.address,
                wallet: soraUSDTTechAddress,
            }
        );

        const mintResult = await usdtMaster.send(alice.getSender(), {
            value: toNano(2),
        },
            {
                $$type: "Mint",
                receiver: bob.address,
                amount: 100000000000n,
            }
        );

        expect(mintResult.transactions).toHaveTransaction({
            from: alice.address,
            to: usdtMaster.address,
            success: true,
        });

        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: jettonApp.address,
            success: true,
        });

        let soraAppWalletAddress = (await JettonApp.fromInit(channel.address)).address;

        let bobWallet = blockchain.openContract(await JettonDefaultWallet.fromInit(usdtMaster.address, bob.address));

        let messagePayloadBuilder = beginCell()
        messagePayloadBuilder = messagePayloadBuilder.storeInt(666, 32);
        let message = messagePayloadBuilder.endCell();

        let transferResult = await bobWallet.send(bob.getSender(), {
            value: toNano(2),
        },
            {
                $$type: "TokenTransfer",
                queryId: 1n,
                amount: 500n,
                destination: soraAppWalletAddress,
                response_destination: bob.address,
                custom_payload: message,
                forward_ton_amount: 0n,
                forward_payload: message,
            }
        );

        expect(transferResult.transactions).toHaveTransaction({
            from: bob.address,
            to: bobWallet.address,
            success: true,
        });
    });
});
