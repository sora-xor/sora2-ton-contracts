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

import "./common";

struct SoraEncodedCall {
    data: Cell;
}

fun newEncodedCall(data: Cell): SoraEncodedCall {
    return SoraEncodedCall{data: data};
}

struct SoraTransferMessage {
    token: Address;
    sender: Address;
    recipient: Bytes32;
    amount: Int;
}

extends fun encode(self: SoraTransferMessage): SoraEncodedCall {
    let builder: Builder = beginCell();
    // 16
    builder = builder.storeUint(0x0600, 16);
    // 272
    builder = builder.storeAlignedAddress(self.token);
    // 272
    builder = builder.storeAlignedAddress(self.sender);
    // 256
    builder = builder.storeBytes32(self.recipient);
    // 128
    builder = builder.storeUint(self.amount, 128);
    require(builder.bits() == 944, "Wrong call encoding");
    return newEncodedCall(builder.endCell());
}


struct RegisterRelayerCall {
    relayer: Address;
    account: Bytes32;
}

extends fun encode(self: RegisterRelayerCall): SoraEncodedCall {
    let builder: Builder = beginCell();
    // 16
    builder = builder.storeUint(0x0900, 16);
    // 272
    builder = builder.storeAlignedAddress(self.relayer);
    // 256
    builder = builder.storeBytes32(self.account);
    require(builder.bits() == 544, "Wrong call encoding");
    return newEncodedCall(builder.endCell());
}

struct CommitmentSubmitted {
    relayer: Address;
    fee: Int;
}

extends fun encode(self: CommitmentSubmitted): SoraEncodedCall {
    let builder: Builder = beginCell();
    // 16
    builder = builder.storeUint(0x0901, 16);
    // 272
    builder = builder.storeAlignedAddress(self.relayer);
    // 128
    builder = builder.storeUint(self.fee, 128);
    require(builder.bits() == 416, "Wrong call encoding");
    return newEncodedCall(builder.endCell());
}

struct SoraJettonRegistered {
    master: Address;
    assetId: Bytes32;
}

extends fun encode(self: SoraJettonRegistered): SoraEncodedCall {
    let builder: Builder = beginCell();
    // 16
    builder = builder.storeUint(0x0601, 16);
    // 272
    builder = builder.storeAlignedAddress(self.master);
    // 256
    builder = builder.storeBytes32(self.assetId);
    require(builder.bits() == 544, "Wrong call encoding");
    return newEncodedCall(builder.endCell());
}

fun encodeFinishAddPeer(): SoraEncodedCall {
    let builder: Builder = beginCell();
    // 16
    builder = builder.storeUint(0x0703, 16);
    require(builder.bits() == 16, "Wrong call encoding");
    return newEncodedCall(builder.endCell());
}

fun encodeFinishRemovePeer(): SoraEncodedCall {
    let builder: Builder = beginCell();
    // 16
    builder = builder.storeUint(0x0702, 16);
    require(builder.bits() == 16, "Wrong call encoding");
    return newEncodedCall(builder.endCell());
}

