struct Bytes32 {
    innerMap: map<Int, Int as uint8>;
}

/// Creates a new `Bytes32` instance filled with zeros.
fun newBytes32(): Bytes32 {
    let returnMap: map<Int, Int as uint8> = emptyMap();

    let i: Int = 0;
    while (i < 32) {
        returnMap.set(i, 0);
        i += 1;
    }

    return Bytes32 {
        innerMap: returnMap
    };
}

/// Checks if the `Bytes32` instance is valid.
extends fun isValid(self: Bytes32): Bool {
    let i: Int = 0;
    while (i < 32) {
        let val: Int? = self.innerMap.get(i);
        if (val == null) {
            return false;
        }
    }
    return true;
}
