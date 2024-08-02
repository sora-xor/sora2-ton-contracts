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

import "@stdlib/ownable";
import "@stdlib/deploy";
import "./jetton.tact";
import "./bridge_call.tact";
import "./channel.tact";

message SendJetton {
    address: Bytes32;
}

message SendJettonInternal {
    master: Address;
    sender: Address;
    recepient: Bytes32;
    amount: Int as uint128;
}

message InitJettonAppWallet {
    wallet: Address;
}

message RegisterJetton {
    master: Address;
    wallet: Address;
}

contract JettonAppWallet with Deployable, Ownable {
    override const storageReserve: Int = ton("0.01");
    owner: Address;
    wallet: Address?;
    master: Address;
    lockedAmount: Int as uint128 = 0;

    init(owner: Address, master: Address){
        require(sender() == owner, "Only owner can init this contract");
        self.owner = owner;
        self.master = master;
    }

    receive(msg: InitJettonAppWallet) {
        require(self.wallet == null, "Wallet already initialized");
        require(sender() == self.owner, "Only owner can init wallet");
        self.wallet = msg.wallet;
    }

    receive(msg: TokenNotification) {
        require(self.wallet != null, "Wallet should be initialized");
        require(sender() == self.wallet, "Only wallet can send this message");
        dump("=================== sdasdasdasd =======================");
        dump("=================== sdasdasdasd =======================");
        dump("=================== sdasdasdasd =======================");
        dump("=================== sdasdasdasd =======================");
        let recepient: SendJetton = SendJetton.fromSlice(msg.forward_payload);
        self.forward(self.owner, SendJettonInternal {
            master: self.master,
            sender: msg.from,
            recepient: recepient.address,
            amount: msg.amount
        }.toCell(), false, null);
    }

    get fun lockedAmount(): Int {
        return self.lockedAmount;
    }
}

contract JettonApp with Deployable, OwnableTransferable {
    override const storageReserve: Int = ton("0.01");
    owner: Address; // Channel

    init(channel: Address){
        self.owner = channel;
    }

    // Send locked token to SORA
    receive(msg: SendJettonInternal){
        let sinit: StateInit = initOf JettonAppWallet(myAddress(), msg.master);
        require(contractAddress(sinit) == sender(), "Invalid sender!");
        let soraMessage: SoraTransferMessage = SoraTransferMessage{
            token: msg.master,
            recipient: msg.recepient,
            sender: msg.sender,
            amount: msg.amount
        };
        self.forward(self.owner, SendOutboundMessage {
            message: soraMessage.encode(),
            sender: msg.sender,
        }.toCell(), false, null);
    }
    
    receive(msg: RegisterJetton) {
        require(sender() == self.owner, "Only owner can register jetton");
        let sinit: StateInit = initOf JettonAppWallet(myAddress(), msg.master);
        send(SendParameters{
                to: contractAddress(sinit),
                value: 0,
                mode: SendRemainingValue,
                body: InitJettonAppWallet{
                    wallet: msg.wallet
                }.toCell(),
                code: sinit.code,
                data: sinit.data
            }
        );
    }
}