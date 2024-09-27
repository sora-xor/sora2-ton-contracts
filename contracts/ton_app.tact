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
import "@stdlib/ownable";
import "./bridge_call.tact";
import "./ichannel.tact";
import "./stoppable.tact";

message SendTon {
    soraAddress: Bytes32;
    amount: Int;
}

message Migrate {
    receiver: Address;
}

message MigrateInternal {
    amount: Int;
}

contract TonApp with Deployable, OwnableTransferable, Stoppable {
    const minReserve: Int = ton("0.01");
    const minFee: Int = ton("0.05");
    owner: Address; // Channel
    lockedAmount: Int as uint128 = 0;
    stopped: Bool = false;

    init(channel: Address, seqno: Int){
        self.owner = channel;
    }

    // lock TON to send it to SORA
    receive(msg: SendTon){
        self.requireOperational();
        require(context().value > self.minFee + msg.amount, "Amount should be greater than value");
        let sender: Address = sender();
        let soraMessage: SoraTonTransferMessage = SoraTonTransferMessage{
            recipient: msg.soraAddress,
            sender: sender,
            amount: msg.amount
        };
        self.lockedAmount += msg.amount;
        nativeReserve(self.minReserve + self.lockedAmount, 0);
        send(
            SendParameters {
                to: self.owner,
                value: 0,
                mode: SendRemainingBalance | SendIgnoreErrors,
                body: SendOutboundMessage {
                    message: soraMessage.encode(),
                    sender: sender()
                }.toCell()
            }
        );
    }
    
    receive(msg: MigrateInternal) {
        self.requireOperational();
        self.lockedAmount += msg.amount;
    }
    
    bounced(msg: bounced<MigrateInternal>) {
        self.resume();
    }
    
    receive(msg: Migrate) {
        self.requireOwner();
        self.requireOperational();
        self.stop();
        send(SendParameters{
            to: msg.receiver,
            value: 0,
            mode: SendRemainingBalance,
            body: MigrateInternal {
                amount: self.lockedAmount
            }.toCell()
        });
    }

    get fun lockedAmount(): Int {
        return self.lockedAmount;
    }

    get fun isStopped(): Bool {
        return self.stopped;
    }
}