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

struct AddressSet {
    data: map<Address, Bool>;
    length: Int as uint16;
    capacity: Int as uint16;
}

extends mutates fun add(self: AddressSet, value: Address) {
    require((self.length + 1) <= self.capacity, "Address set is full");
    require(self.data.get(value) != true, "Address already added");
    self.data.set(value, true);
    self.length += 1;
}

extends mutates fun remove(self: AddressSet, value: Address) {
    require(self.data.del(value) == true, "App not found");
    self.length -= 1;
}

extends fun has(self: AddressSet, value: Address): Bool {
    return self.data.get(value) == true;
}

extends fun len(self: AddressSet): Int {
    return self.length;
}

fun emptyAddressSet(capacity: Int): AddressSet {
    return AddressSet {data: emptyMap(), length: 0, capacity: capacity};
}

struct IntSet {
    data: map<Int as uint256, Bool>;
    length: Int as uint16;
    capacity: Int as uint16;
}

extends mutates fun add(self: IntSet, value: Int) {
    require((self.length + 1) <= self.capacity, "Int set is full");
    require(self.data.get(value) != true, "Int already added");
    self.data.set(value, true);
    self.length += 1;
}

extends mutates fun remove(self: IntSet, value: Int) {
    require(self.data.del(value) == true, "App not found");
    self.length -= 1;
}

extends fun has(self: IntSet, value: Int): Bool {
    return self.data.get(value) == true;
}

extends fun len(self: IntSet): Int {
    return self.length;
}

fun emptyIntSet(capacity: Int): IntSet {
    return IntSet {data: emptyMap(), length: 0, capacity: capacity};
}