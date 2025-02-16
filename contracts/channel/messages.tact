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

import "../primitives/call";
import "../primitives/common";
import "../primitives/set";

const MAX_MESSAGES: Int = 50;
const MAX_APPS: Int = 20;
const MAX_PEERS: Int = 20;

message OutboundMessage {
    nonce: Int as uint64;
    message: SoraEncodedCall;
    source: Address;
}

message SendInboundMessages {
    commitment: Commitment;
    proof: CommitmentProof;
}

extends fun getFee(self: SendInboundMessages, ctx: Context): Int {
    let messages: Int = 0;
    foreach (_, _ in self.commitment.messages) {
        messages += 1;
    }
    require(messages <= MAX_MESSAGES, "Messages limit reached");
    // Submit messages + return remaining funds to relayer
    let fee = (ctx.readForwardFee() + ton("0.01")) * (messages + 2);
    return fee;
}

extends fun getProcessingFee(self: SendInboundMessages, ctx: Context, peers: Int): Int {
    // Verify commitment
    return ton("0.02") * peers;
}

struct InboundMessage {
    target: Address;
    data: Cell;
    fee: Int;
}

struct Commitment {
    nonce: Int as uint64;
    totalFee: Int;
    messages: map<Int as uint16, InboundMessage>;
}

struct Signature {
    publicKey: Int;
    signature: Slice;
}

struct CommitmentProof {
    sigs: map<Int as uint16, Signature>;
}

message RegisterApp {
    app: Address;
}

extends fun tryLoadRegisterApp(self: Slice): RegisterApp? {
    try {
        return RegisterApp.fromSlice(self);
    } catch (e) {
        return null;
    }
}

extends fun getFee(self: RegisterApp, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01"));
    return fee;
}

extends fun getProcessingFee(self: RegisterApp, ctx: Context): Int {
    // Verify commitment
    return ton("0.01");
}

message RemoveApp {
    app: Address;
}

extends fun tryLoadRemoveApp(self: Slice): RemoveApp? {
    try {
        return RemoveApp.fromSlice(self);
    } catch (e) {
        return null;
    }
}

extends fun getFee(self: RemoveApp, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01"));
    return fee;
}

extends fun getProcessingFee(self: RemoveApp, ctx: Context): Int {
    // Verify commitment
    return ton("0.01");
}

message Migrate {
    receiver: Address;
}

extends fun tryLoadMigrate(self: Slice): Migrate? {
    try {
        return Migrate.fromSlice(self);
    } catch (e) {
        return null;
    }
}

extends fun getFee(self: Migrate, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01"));
    return fee;
}

extends fun getProcessingFee(self: Migrate, ctx: Context): Int {
    // Verify commitment
    return ton("0.01");
}

message AddPeer {
    peer: Int as uint256;
}

extends fun tryLoadAddPeer(self: Slice): AddPeer? {
    try {
        return AddPeer.fromSlice(self);
    } catch (e) {
        return null;
    }
}

extends fun getFee(self: AddPeer, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getProcessingFee(self: AddPeer, ctx: Context): Int {
    // Verify commitment
    return ton("0.01");
}

message RemovePeer {
    peer: Int as uint256;
}

extends fun tryLoadRemovePeer(self: Slice): RemovePeer? {
    try {
        return RemovePeer.fromSlice(self);
    } catch (e) {
        return null;
    }
}

extends fun getFee(self: RemovePeer, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getProcessingFee(self: RemovePeer, ctx: Context): Int {
    // Verify commitment
    return ton("0.01");
}

message RegisterRelayer {
    account: Bytes32;
}

extends fun getFee(self: RegisterRelayer, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getProcessingFee(self: RegisterRelayer, ctx: Context): Int {
    // Verify commitment
    return ton("0.01");
}

message MigrateInternal {
    outboundNonce: Int as uint64;
    inboundNonce: Int as uint64;
    apps: AddressSet;
}
