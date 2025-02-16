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

import { Dictionary, toNano } from '@ton/core';
import { JettonApp } from '../wrappers/JettonApp';
import { NetworkProvider } from '@ton/blueprint';
import { Channel } from '../wrappers/Channel';

export async function run(provider: NetworkProvider) {
    const peers = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
    peers.set(BigInt("0x18cb0d295d767226261f4ae71fbecb6f3eb837f2cd19ed2870613582c24f14a8"), true);
    peers.set(BigInt("0x8d2bc45a60d9dab43b3facd01e4feb1e7cbcbd15cbaa9d2805c5eba2215f5a31"), true);
    peers.set(BigInt("0x2e9b64866711d5d8886af7e7a8ec7d5f0edf1b259a676c9397e96898252a5450"), true);
    peers.set(BigInt("0x60cfbc3bdcef2f6dd75f982e8eaf56df4a21f8632b623128317dc4862d61c145"), true);
    peers.set(BigInt("0x2225fc10834f9d7c5dea087e48ff13da3a01f9ce1c289db40ccbdd71f701f3fe"), true);
    const channel = provider.open(await Channel.fromInit(4n, peers, null));
    const tonApp = provider.open(await JettonApp.fromInit(channel.address, BigInt(0)));

    if (await provider.isContractDeployed(channel.address)) {
        console.log("Skip channel deploy");

    } else {
        await channel.send(
            provider.sender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 1n,
            }
        );
        await provider.waitForDeploy(channel.address, 20);
    }


    if (await provider.isContractDeployed(tonApp.address)) {
        console.log("Skip TonApp deploy");
    } else {
        await tonApp.send(
            provider.sender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 1n,
            }
        );

        await provider.waitForDeploy(tonApp.address, 20);
    }

    console.log({
        tonApp: tonApp.address,
        channel: channel.address
    });

    // run methods on `soraApp`
}
