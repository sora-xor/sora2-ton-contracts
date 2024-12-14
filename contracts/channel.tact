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
import "./stoppable.tact";
import "./types.tact";
import "./ichannel.tact";

message OutboundMessage {
    nonce: Int as uint64;
    message: SoraEncodedCall;
    source: Address;
}

message RegisterApp {
    app: Address;
}

message RemoveApp {
    app: Address;
}

message Reset {}

message Migrate {
    receiver: Address;
}

message MigrateInternal {
    outboundNonce: Int as uint64;
    inboundNonce: Int as uint64;
    apps: Apps;
}

contract Channel with Deployable, OwnableTransferable, Stoppable {
    override const storageReserve: Int = ton("0.01");
    owner: Address;
    outboundNonce: Int as uint64 = 0;
    apps: Apps;
    stopped: Bool = false;

    init(owner: Address, seqno: Int){
        self.owner = owner;
        self.apps = emptyApps();
    }
    
    get fun isApp(app: Address): Bool {
        return self.apps.has(app);
    }
    
    get fun apps(): Apps {
        return self.apps;
    }

    get fun outboundNonce(): Int {
        return self.outboundNonce;
    }
    
    fun requireApp() {
        require(self.apps.has(sender()), "Only apps can send messages");
    }
    
    receive(msg: SendOutboundMessage) {
        /// State inside of `try` will be rolled back if something went wrong
        try {
            self.requireApp();
            self.outboundNonce += 1;
            emit(OutboundMessage {
                nonce: self.outboundNonce,
                message: msg.message,
                source: sender(),
            }.toCell());
        }
        self.forward(msg.sender, null, false, null);
    }
    
    receive(msg: RegisterApp) {
        self.requireOwner();
        self.apps.add(msg.app);
        self.notify(null);
    }
    
    receive(msg: RemoveApp) {
        self.requireOwner();
        self.apps.remove(msg.app);
        self.notify(null);
    }
    
    receive(msg: Reset) {
        self.requireOwner();
        self.outboundNonce = 0;
        self.resume();
        self.notify(null);
    }
    
    receive(msg: SendInboundMessage) {
        self.requireOwner();
        require(self.apps.has(msg.target), "Can only send messages to apps");
        self.forward(msg.target, msg.message, true, null);
    }
    
    /// Migration failed, revert
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
                outboundNonce: self.outboundNonce,
                inboundNonce: 0,
                apps: self.apps
            }.toCell()
        });
    }
    
    receive(msg: MigrateInternal) {
        self.requireOwner();
        self.requireOperational();
        self.outboundNonce = msg.outboundNonce;
        self.apps = msg.apps;
    }
}