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
import "../traits/reserve_fee";
import "../traits/stoppable";
import "../primitives/set";
import "./messages";
import "./external";

contract Channel with Deployable, Stoppable, ReserveFee {
    override const minTonsForStorage: Int = ton("0.01");
    outboundNonce: Int as uint64 = 0;
    inboundNonce: Int as uint64 = 0;
    stopped: Bool = true;
    apps: AddressSet;
    peers: IntSet;

    init(seqno: Int, peers: map<Int, Bool>, prevChannel: Address?) {
        self.apps = emptyAddressSet(MAX_APPS);
        self.peers = emptyIntSet(MAX_PEERS);
        foreach (peer, _ in peers) {
            self.peers.add(peer);
        }
        if (prevChannel == null) {
            self.stopped = false;
        }
    }
    
    get fun isApp(app: Address): Bool {
        return self.apps.has(app);
    }
    
    get fun apps(): AddressSet {
        return self.apps;
    }
    
    get fun isPeer(peer: Int): Bool {
        return self.peers.has(peer);
    }

    get fun peers(): IntSet {
        return self.peers;
    }

    get fun outboundNonce(): Int {
        return self.outboundNonce;
    }

    get fun inboundNonce(): Int {
        return self.inboundNonce;
    }
    
    fun requireApp() {
        require(self.apps.has(sender()), "Only apps can send messages");
    }
    
    fun requireThis() {
        require(myAddress() == sender(), "Only apps can send messages");
    }
    
    fun threshold(): Int {
        return self.peers.len() - ((self.peers.len() - 1) / 3);
    }
    
    fun verifyProof(commitmentHash: Int, proof: CommitmentProof) {
        let checked = emptyIntSet(MAX_PEERS);
        foreach (_, sig in proof.sigs) {
            require(self.peers.has(sig.publicKey), "Invalid peer public key");
            require(checkSignature(commitmentHash, sig.signature, sig.publicKey), "Invalid signature");
            /// Will fail if public key already added
            checked.add(sig.publicKey);
        }
        require(checked.len() >= self.threshold(), "Not enough signatures");
    }
    
    receive(msg: SendOutboundMessage) {
        self.requireOperational();
        self.requireApp();
        self.reserveStorageFee();
        self.sendOutboundMessage(msg.message, sender());
        self.forwardBalanceIgnoreErrors(msg.sender, null);
    }

    fun sendOutboundMessage(msg: SoraEncodedCall, source: Address) {
        self.outboundNonce += 1;
        emit(OutboundMessage {
            nonce: self.outboundNonce,
            message: msg,
            source: sender(),
        }.toCell());
    }

    fun processMigrate(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadMigrate();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Migrate");
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.stop();
        self.forwardBalance(msg.receiver, MigrateInternal {
            outboundNonce: self.outboundNonce,
            inboundNonce: self.inboundNonce,
            apps: self.apps
        }.toCell());
        return true;
    }
    
    fun processRegisterApp(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadRegisterApp();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Register App");
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.apps.add(msg.app);
        self.forwardBalanceIgnoreErrors(relayer, null);
        return true;
    }
    
    fun processRemoveApp(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadRemoveApp();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Remove app");
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.apps.remove(msg.app);
        self.forwardBalanceIgnoreErrors(relayer, null);
        return true;
    }

    fun processAddPeer(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadAddPeer();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Add Peer");
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.peers.add(msg.peer);
        self.sendOutboundMessage(encodeFinishAddPeer(), myAddress());
        self.forwardBalanceIgnoreErrors(relayer, null);
        return true;
    }
    
    fun processRemovePeer(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadRemovePeer();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Remove Peer");
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.peers.remove(msg.peer);
        self.sendOutboundMessage(encodeFinishRemovePeer(), myAddress());
        self.forwardBalanceIgnoreErrors(relayer, null);
        return true;
    }
    
    fun processInboundMessage(rawMsg: Slice, relayer: Address) {
        if (self.processRegisterApp(rawMsg, relayer)) {
            return;
        }
        if (self.processRemoveApp(rawMsg, relayer)) {
            return;
        }
        if (self.processAddPeer(rawMsg, relayer)) {
            return;
        }
        if (self.processRemovePeer(rawMsg, relayer)) {
            return;
        }
        if (self.processMigrate(rawMsg, relayer)) {
            return;
        }
        require(false, "Unknown message");
    }
    
    receive(msg: InboundMessageInternal) {
        self.requireOperational();
        self.requireThis();
        self.reserveStorageFee();
        try {
            self.processInboundMessage(msg.msg.asSlice(), msg.relayer);
        } catch (e) {
            self.forwardBalanceIgnoreErrors(msg.relayer, null);
        }
    }

    receive(msg: RegisterRelayer) {
        self.requireOperational();
        self.reserveStorageFee();
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.sendOutboundMessage(RegisterRelayerCall {
            relayer: ctx.sender,
            account: msg.account
        }.encode(), myAddress());
    }
    
    receive(msg: SendInboundMessages) {
        dump("Got commitment");
        self.requireOperational();
        self.reserveStorageFee();
        let ctx: Context = context();
        let totalFee = self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx, self.peers.len()));
        require(self.inboundNonce + 1 == msg.commitment.nonce, "Invalid commitment nonce");
        let commitmentHash: Int = msg.commitment.toCell().hash();
        self.verifyProof(commitmentHash, msg.proof);
        self.inboundNonce += 1;
        foreach (_, msgInner in msg.commitment.messages) {
            dump("Send message to app");
            dump(msgInner.target);
            send(SendParameters {
                to: msgInner.target,
                value: msgInner.fee,
                mode: SendIgnoreErrors,
                body: InboundMessageInternal {
                    relayer: sender(),
                    msg: msgInner.data,
                }.toCell(),
            });
        }
        self.sendOutboundMessage(CommitmentSubmitted{
            relayer: ctx.sender,
            fee: totalFee
        }.encode(), myAddress());
        self.forwardBalanceIgnoreErrors(sender(), null);
    }
}