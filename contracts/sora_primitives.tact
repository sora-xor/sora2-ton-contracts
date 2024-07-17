struct Bytes32 {
    data: Int;
}

/// Creates a new `Bytes32` instance filled with zeros.
fun newBytes32(): Bytes32 {
    return Bytes32 {
        data: 0
    };
}

extends mutates fun set(self: Bytes32, index: Int, value: Int) { 
    self.data |= value << index * 8 
}

extends fun get(self: Bytes32, index: Int): Int { 
    return (self.data >> index * 8) & 0xFF 
}