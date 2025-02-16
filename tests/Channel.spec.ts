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

import { Blockchain, SandboxContract, TreasuryContract, EventMessageSent, Treasury } from '@ton/sandbox';
import { Address, address, beginCell, Builder, toNano } from '@ton/core';
import '@ton/test-utils';
import assert from 'assert';
import { Channel, loadOutboundMessage, loadSendOutboundMessage, storeAddressSet, storeOutboundMessage, storeSendOutboundMessage } from '../wrappers/Channel';
import { TestChannel } from './TestChannel';

describe('Channel', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let relayer: SandboxContract<TreasuryContract>;
    let app: SandboxContract<TreasuryContract>;
    let channel: TestChannel;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        relayer = await blockchain.treasury('relayer');
        app = await blockchain.treasury('app');

        channel = await TestChannel.fromInit(blockchain, 0n, 5n);
        await channel.deploy(deployer);
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and channel are ready to use
    });

    it('should register app', async () => {
        await channel.registerApp(relayer, app.address);
    });

    it('should remove app', async () => {
        await channel.registerApp(relayer, app.address);
        await channel.removeApp(relayer, app.address);
    });

    it('should not remove non existing app', async () => {
        await channel.removeApp(relayer, app.address, false, false);
    });

    it('should not register the same app', async () => {
        await channel.registerApp(relayer, app.address);
        await channel.registerApp(relayer, app.address, false, true);
    });

    it("should not register more than 20 apps", async () => {
        for (let i = 0; i < 20; i++) {
            const app = await blockchain.treasury(`app-${i}`);
            await channel.registerApp(relayer, app.address);
        }
        const app = await blockchain.treasury("last-app");
        await channel.registerApp(relayer, app.address, false, false);
    });

    it('should submit message', async () => {
        await channel.registerApp(relayer, app.address);
        const sender = await blockchain.treasury("sender");
        const result = await channel.sendRaw(
            app.getSender(),
            { value: toNano(1), },
            {
                $$type: "SendOutboundMessage",
                sender: sender.address,
                message: {
                    $$type: "SoraEncodedCall",
                    data: beginCell().storeInt(12, 32).endCell()
                }
            }
        );
        expect(result.transactions).toHaveTransaction({
            from: app.address,
            to: channel.address,
            inMessageBounced: false,
            success: true,
            body: beginCell().store(storeSendOutboundMessage({
                $$type: "SendOutboundMessage",
                sender: sender.address,
                message: {
                    $$type: "SoraEncodedCall",
                    data: beginCell().storeInt(12, 32).endCell()
                }
            })).asCell()
        });
        expect(result.transactions).toHaveTransaction({
            from: channel.address,
            to: sender.address,
            success: true,
        });
        const outboundEvent = result.externals[0];
        expect(outboundEvent.body).toEqualCell(beginCell().store(storeOutboundMessage({
            $$type: "OutboundMessage",
            message: {
                $$type: "SoraEncodedCall",
                data: beginCell().storeInt(12, 32).endCell()
            },
            nonce: 1n,
            source: app.address,
        })).asCell())
        expect(Number(await channel.getOutboundNonce())).toBe(1);
    });

    it('should not submit message from wrong app', async () => {
        const sender = await blockchain.treasury("sender");
        const result = await channel.sendRaw(
            app.getSender(),
            { value: toNano(1), },
            {
                $$type: "SendOutboundMessage",
                sender: sender.address,
                message: {
                    $$type: "SoraEncodedCall",
                    data: beginCell().storeInt(12, 32).endCell()
                }
            }
        );
        expect(result.transactions).toHaveTransaction({
            from: app.address,
            to: channel.address,
            inMessageBounced: false,
            success: true,
            body: beginCell().store(storeSendOutboundMessage({
                $$type: "SendOutboundMessage",
                sender: sender.address,
                message: {
                    $$type: "SoraEncodedCall",
                    data: beginCell().storeInt(12, 32).endCell()
                }
            })).asCell()
        });
        expect(result.transactions).toHaveTransaction({
            from: channel.address,
            to: sender.address,
            success: true,
        });
        expect(result.externals).toHaveLength(0);
        expect(Number(await channel.getOutboundNonce())).toBe(0);
    });
});
