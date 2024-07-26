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
import { loadSendOutboundMessage, } from '../wrappers/TonApp';
import '@ton/test-utils';
import assert from 'assert';
import { Channel, loadOutboundMessage } from '../wrappers/Channel';

describe('Channel', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let app: SandboxContract<TreasuryContract>;
    let channel: SandboxContract<Channel>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');
        app = await blockchain.treasury('app');

        channel = blockchain.openContract(await Channel.fromInit());


        const deployResult = await channel.send(
            deployer.getSender(),
            {
                value: toNano(1),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
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
                app: app.address
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: channel.address,
            success: true,
        });

        assert(await channel.getIsApp(app.address));
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and channel are ready to use
    });

    it('should transfer', async () => {
        const sender = await blockchain.treasury("sender");
        console.log(deployer.address, await deployer.getBalance());
        console.log(sender.address, await sender.getBalance());
        const result = await channel.send(app.getSender(), {
            value: toNano(1),
        },
            {
                $$type: "SendOutboundMessage",
                sender: sender.address,
                message: {
                    $$type: "SoraEncodedCall",
                    data: beginCell().storeInt(12, 32).endCell()
                }
            }
        );
        const transfer = result.events[0];
        assert(transfer.type == "message_sent");
        assert(transfer.bounced == false);
        assert(transfer.from.toString() == app.address.toString());
        assert(transfer.to.toString() == channel.address.toString());
        const tonTransfer = loadSendOutboundMessage(transfer.body.asSlice());
        assert(tonTransfer.sender.toString() == sender.address.toString());
        assert(tonTransfer.message.data.bits.toString() == "0000000C");
        const outboundEvent = result.externals[0];
        const outboundMessage = loadOutboundMessage(outboundEvent.body.asSlice());
        assert(outboundMessage.nonce == BigInt(1));
        assert(outboundMessage.message.data.bits.toString() == "0000000C");
        assert(outboundMessage.source.toString() == app.address.toString());
    });
});
