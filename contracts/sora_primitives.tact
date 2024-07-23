struct Bytes32 {
    data: Int as uint256;
}
struct Balance {
    data: Int as uint128;
}

/// Creates a new `Bytes32` instance filled with zeros.
fun newBytes32(): Bytes32 {
    return Bytes32{data: 0};
}

/// Creates a new `Balance` instance filled with zeros.

fun newBalance(balance: Int): Balance {
    require(balance >= 0, "Balance could not be below zero");
    require(balance <= 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF, "Balance should fit into u128");
    return Balance{data: 0};
}

extends fun storeBytes32(self: Builder, bytes: Bytes32): Builder {
    return self.storeUint(bytes.data, 256);
}

extends fun storeBalance(self: Builder, balance: Balance): Builder {
    return self.storeUint(balance.data, 128);
}

extends fun storeAlignedAddress(self: Builder, address: Address): Builder {
    self = self.storeUint(0, 5);
    return self.storeAddress(address);
}