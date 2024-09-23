// // This file is part of the SORA network and Polkaswap app.

// // Copyright (c) 2020, 2021, Polka Biome Ltd. All rights reserved.
// // SPDX-License-Identifier: BSD-4-Clause

// // Redistribution and use in source and binary forms, with or without modification,
// // are permitted provided that the following conditions are met:

// // Redistributions of source code must retain the above copyright notice, this list
// // of conditions and the following disclaimer.
// // Redistributions in binary form must reproduce the above copyright notice, this
// // list of conditions and the following disclaimer in the documentation and/or other
// // materials provided with the distribution.
// //
// // All advertising materials mentioning features or use of this software must display
// // the following acknowledgement: This product includes software developed by Polka Biome
// // Ltd., SORA, and Polkaswap.
// //
// // Neither the name of the Polka Biome Ltd. nor the names of its contributors may be used
// // to endorse or promote products derived from this software without specific prior written permission.

// // THIS SOFTWARE IS PROVIDED BY Polka Biome Ltd. AS IS AND ANY EXPRESS OR IMPLIED WARRANTIES,
// // INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// // A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Polka Biome Ltd. BE LIABLE FOR ANY
// // DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// // BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// // OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// // STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
// // USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// //! A collection of node-specific RPC methods.
// //! Substrate provides the `sc-rpc` crate, which defines the core RPC layer
// //! used by Substrate nodes. This file extends those RPC definitions with
// //! capabilities that are specific to this project's runtime configuration.

// import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
// import { Address, address, beginCell, Builder, toNano } from '@ton/core';
// import { loadSendOutboundMessage, loadSendTon, TonApp } from '../wrappers/TonApp';
// import '@ton/test-utils';
// import assert from 'assert';

// describe('TonApp', () => {
//     let blockchain: Blockchain;
//     let deployer: SandboxContract<TreasuryContract>;
//     let channel: SandboxContract<TreasuryContract>;
//     let tonApp: SandboxContract<TonApp>;

//     beforeEach(async () => {
//         blockchain = await Blockchain.create();

//         deployer = await blockchain.treasury('deployer');
//         channel = await blockchain.treasury('channel');

//         tonApp = blockchain.openContract(await TonApp.fromInit(channel.address));


//         const deployResult = await tonApp.send(
//             deployer.getSender(),
//             {
//                 value: toNano(1),
//             },
//             {
//                 $$type: 'Deploy',
//                 queryId: 0n,
//             }
//         );

//         expect(deployResult.transactions).toHaveTransaction({
//             from: deployer.address,
//             to: tonApp.address,
//             deploy: true,
//             success: true,
//         });
//     });

//     it('should deploy', async () => {
//         // the check is done inside beforeEach
//         // blockchain and soraApp are ready to use
//     });

//     it('should transfer', async () => {
//         const sender = await blockchain.treasury("sender");
//         console.log(deployer.address, await deployer.getBalance());
//         console.log(channel.address, await channel.getBalance());
//         console.log(sender.address, await sender.getBalance());
//         const result = await tonApp.send(sender.getSender(), {
//             value: toNano(2),
//         },
//             {
//                 $$type: "SendTon",
//                 soraAddress: {
//                     $$type: "Bytes32",
//                     data: BigInt(14)
//                 },
//                 amount: toNano(1)
//             }
//         );
//         const transfer = result.events[0];
//         assert(transfer.type == "message_sent");
//         const tonTransfer = loadSendTon(transfer.body.asSlice());
//         assert(tonTransfer.amount == toNano(1));
//         assert(tonTransfer.soraAddress.data == BigInt(14));
//         const outboundEvent = result.events[1];
//         assert(outboundEvent.type == "message_sent");
//         const outboundMessage = loadSendOutboundMessage(outboundEvent.body.asSlice());
//         assert(outboundMessage.sender.toString() == sender.address.toString());
//         assert(outboundMessage.message.data.bits.toString() == "06000000000000000000000000000000000000000000000000000000000000000000000004004F0012472F2F564E18692F950888322B5075B3CFA32386AF7A84F3F84EE32418000000000000000000000000000000000000000000000000000000000000000E0000000000000000000000003B9ACA00");
//     });
// });
