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

import "@stdlib/deploy";
import "./types.tact";
import "./scale_codec.tact";
import "./sora_jetton_wallet.tact";

contract SoraApp with Deployable {

    owner: Address;
    lockedAmount: Int as uint32 = 0;
    messageQueue: map<Int, SoraEncodedMessage> = emptyMap();
    messageNonce: Int as uint16 = 0;

    init() {
        self.owner = context().sender;
    }

    // lock TON to send it to SORA
    receive(msg: TONTransfer) {
        let tokenAmount = context().value;
        let soraMessage = SoraTransferMessage {
            reciever: msg.soraAddress,
            assetId: msg.assetId,
            amount: tokenAmount,
        };

        let encodedMessage = soraMessage.encode();

        self.messageQueue.set(self.messageNonce, encodedMessage);
        self.messageNonce += 1;
    }

    //
    receive(msg: RegisterJetton) {
        require(context().sender == self.owner, "Only owner can register a jetton");
        let init: StateInit = initOf SoraJettonWallet(myAddress());
        send(SendParameters{
                to: contractAddress(init),
                body: msg.toCell(),
                value: ton("0.2"),
                mode: SendIgnoreErrors,
                code: init.code,
                data: init.data,
            }
        );
    }

    // Migrate contract to another address
    receive(msg: Migrate) {
        require(context().sender == self.owner, "Only owner can migrate the contract");
    }

    get fun lockedAmount(): Int {
        return self.lockedAmount;
    }

    get fun messageQueue(): map<Int, SoraEncodedMessage> {
        return self.messageQueue;
    }

    get fun messageNonce(): Int {
        return self.messageNonce;
    }

    // todo! remove this function after testing
    get fun test(): SoraEncodedMessage {
        let soraTransferMessage = SoraTransferMessage {
            reciever: Bytes32 {
                data: 0x0101010101010101010101010101010101010101010101010101010101010102
            },
            assetId: Bytes32 {
                data: 0x0201010101010101010101010101010101010101010101010101010101010103
            },
            amount: 6666,
        };
        return soraTransferMessage.encode();
    }
}
