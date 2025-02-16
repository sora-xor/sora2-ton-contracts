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

import "../primitives/common";
import "../jetton/messages";

message UnlockJetton {
    master: Address;
    recepient: Address;
    amount: Int as uint128;
}

extends fun getFee(self: UnlockJetton, ctx: Context): Int {
    // Worst case is sidechain Jetton transfer, which have 5 messages in flow
    // UnlockJettonInternal from JettonApp to Collector (should be already deployed)
    // Mint from Collector to Jetton master (should be already deployed)
    // TokenTransferInternal from Jetton master to Jetton wallet (could be deployed at this step)
    // TokenNotification from Jetton wallet to Jetton wallet owner
    // TokenExcesses from Jetton wallet to relayer
    let fee = (ctx.readForwardFee() + ton("0.01")) * 5;
    return fee;
}

extends fun getProcessingFee(self: UnlockJetton, ctx: Context): Int {
    return ton("0.05");
}

extends fun tryLoadUnlockJetton(self: Slice): UnlockJetton? {
    try {
        return UnlockJetton.fromSlice(self);
    } catch (e) {
        return null;
    }
}

message RegisterJetton {
    master: Address;
    wallet: Address;
}

extends fun getFee(self: RegisterJetton, ctx: Context): Int {
    // RegisterJettonInternal from JettonApp to Collector (will be deployed)
    // TokenExcesses from Collector to relayer
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getProcessingFee(self: RegisterJetton, ctx: Context): Int {
    return ton("0.05");
}

extends fun tryLoadRegisterJetton(self: Slice): RegisterJetton? {
    try {
        return RegisterJetton.fromSlice(self);
    } catch (e) {
        return null;
    }
}

message RegisterSoraJetton {
    assetId: Bytes32;
    content: Tep64TokenData;
}

extends fun getJettonFee(self: RegisterSoraJetton, ctx: Context): Int {
    // JettonDeploy from JettonApp to Jetton master (will be deployed)
    // TokenExcesses from Collector to relayer
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getCollectorFee(self: RegisterSoraJetton, ctx: Context): Int {
    // RegisterSoraJettonInternal from JettonApp to Collector (will be deployed)
    // TokenExcesses from Collector to relayer
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getChannelFee(self: RegisterSoraJetton, ctx: Context): Int {
    // RegisterSoraJettonInternal from JettonApp to Collector (will be deployed)
    // TokenExcesses from Collector to relayer
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getProcessingFee(self: RegisterSoraJetton, ctx: Context): Int {
    return ton("0.1");
}

extends fun tryLoadRegisterSoraJetton(self: Slice): RegisterSoraJetton? {
    try {
        return RegisterSoraJetton.fromSlice(self);
    } catch (e) {
        return null;
    }
}

message(0x7D195A20) RegisterSoraJettonSimple {
    assetId: Bytes32;
    content: Tep64TokenData;
}

extends fun tryLoadRegisterSoraJettonSimple(self: Slice): RegisterSoraJettonSimple? {
    try {
        let type = self.loadUint(32);
        require(type == 0x7D195A20, "Wrong message type");
        let assetId = self.loadBytes32();
        let uriLen = self.loadUint(8);
        let uri = self.loadBits(uriLen * 8);
        let content = beginCell().storeUint(1, 8).storeSlice(uri).endCell();
        return RegisterSoraJettonSimple {
            assetId: assetId,
            content: Tep64TokenData{
                flag: 1,
                content: uri.asString(),
            }
        };
    } catch (e) {
        return null;
    }
}

extends fun getJettonFee(self: RegisterSoraJettonSimple, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getCollectorFee(self: RegisterSoraJettonSimple, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getChannelFee(self: RegisterSoraJettonSimple, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}


extends fun getProcessingFee(self: RegisterSoraJettonSimple, ctx: Context): Int {
    return ton("0.1");
}

message RegisterTon {}

extends fun getFee(self: RegisterTon, ctx: Context): Int {
    // RegisterTonInternal from JettonApp to Collector (will be deployed)
    // TokenExcesses from Collector to relayer
    let fee = (ctx.readForwardFee() + ton("0.01")) * 2;
    return fee;
}

extends fun getProcessingFee(self: RegisterTon, ctx: Context): Int {
    return ton("0.05");
}

extends fun tryLoadRegisterTon(self: Slice): RegisterTon? {
    try {
        return RegisterTon.fromSlice(self);
    } catch (e) {
        return null;
    }
}

// User messages

message SendTon {
    soraAddress: Bytes32;
    amount: Int;
}

extends fun getFee(self: SendTon, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.01")) * 3;
    return fee;
}

extends fun getProcessingFee(self: SendTon, ctx: Context): Int {
    return ton("0.01");
}

message LockJetton {
    address: Bytes32;
}

extends fun getBurnFee(self: LockJetton, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.02")) * 2;
    return fee;
}

extends fun getSubmitFee(self: LockJetton, ctx: Context): Int {
    let fee = (ctx.readForwardFee() + ton("0.02")) * 3;
    return fee;
}

extends fun getProcessingFee(self: LockJetton, ctx: Context): Int {
    let fee = ton("0.02");
    return fee;
}

extends fun tryLoadLockJetton(self: Slice): LockJetton? {
    try {
        return LockJetton.fromSlice(self);
    } catch (e) {
        return null;
    }
}

// Migration

message StartMigration {}

extends fun getFee(self: StartMigration, ctx: Context): Int {
    // RegisterTonInternal from JettonApp to Collector (will be deployed)
    // TokenExcesses from Collector to relayer
    let fee = (ctx.readForwardFee() + ton("0.01"));
    return fee;
}

extends fun getProcessingFee(self: StartMigration, ctx: Context): Int {
    return ton("0.01");
}

extends fun tryLoadStartMigration(self: Slice): StartMigration? {
    try {
        return StartMigration.fromSlice(self);
    } catch (e) {
        return null;
    }
}

message MigrateCollector {
    master: Address;
    collector: Address;
    relayer: Address;
}

extends fun getFee(self: MigrateCollector, ctx: Context): Int {
    // RegisterTonInternal from JettonApp to Collector (will be deployed)
    // TokenExcesses from Collector to relayer
    let fee = (ctx.readForwardFee() + ton("0.01")) * 5;
    return fee;
}

extends fun getProcessingFee(self: MigrateCollector, ctx: Context): Int {
    return ton("0.01");
}

extends fun tryLoadMigrateCollector(self: Slice): MigrateCollector? {
    try {
        return MigrateCollector.fromSlice(self);
    } catch (e) {
        return null;
    }
}

// Internal messages

message LockJettonInternal {
    master: Address;
    sender: Address;
    recepient: Bytes32;
    amount: Int as uint128;
}

message UnlockJettonInternal {
    relayer: Address;
    recepient: Address;
    amount: Int as uint128;
}

message RegisterJettonInternal {
    relayer: Address;
    wallet: Address;
}

message RegisterTonInternal {
    relayer: Address;
}

message RegisterSoraJettonInternal {
    relayer: Address;
    wallet: Address;
}

message MigrateCollectorInternal {
    collector: Address;
}

message MigrateTon {
    relayer: Address;
    amount: Int;
}