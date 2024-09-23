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
import "@stdlib/deploy";
import "@stdlib/ownable";
import "./bridge_call.tact";

message OutboundMessage {
    nonce: Int as uint64;
    message: SoraEncodedCall;
    source: Address;
}

message SendOutboundMessage {
    message: SoraEncodedCall;
    sender: Address;
}

message SendInboundMessage {
    target: Address;
    message: Cell;
}

message RegisterApp {
    app: Address;
}

message Reset {}

contract Channel with Deployable, OwnableTransferable {
    override const storageReserve: Int = ton("0.01");
    owner: Address;
    outboundNonce: Int as uint64 = 0;
    apps: map<Address, Bool>;

    init(){
        self.owner = sender();
    }
    
    get fun isApp(app: Address): Bool {
        return self.apps.get(app) == true;
    }
    
    get fun apps(): map<Address, Bool> {
        return self.apps;
    }

    get fun outboundNonce(): Int {
        return self.outboundNonce;
    }
    
    fun requireApp() {
        require(self.apps.get(sender()) == true, "Only apps can send messages");
    }
    
    receive(msg: SendOutboundMessage) {
        self.requireApp();
        self.outboundNonce += 1;
        emit(OutboundMessage {
            nonce: self.outboundNonce,
            message: msg.message,
            source: sender(),
        }.toCell());
        self.forward(msg.sender, null, false, null);
        dump("URA");
    }
    
    receive(msg: RegisterApp) {
        self.requireOwner();
        self.apps.set(msg.app, true);
        self.notify(null);
    }
    
    receive(msg: Reset) {
        self.requireOwner();
        self.outboundNonce = 0;
        self.notify(null);
    }

    receive("test") {
        dump("test");
    }
    
    receive(msg: SendInboundMessage) {
        self.requireOwner();
        require(self.apps.get(msg.target) == true, "Can only send messages to apps");
        self.forward(msg.target, msg.message, true, null);
    }
}