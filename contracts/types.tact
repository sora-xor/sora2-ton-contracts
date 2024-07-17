import "./sora_primitives.tact";

struct SoraTransferMessage {
    reciever: Bytes32;
    assetId: Bytes32;
    amount: Int;
}

struct SoraEncodedMessage {
    data: map<Int, Int as uint8>;
}

fun emptySoraEncodedMessage(): SoraEncodedMessage {
    return SoraEncodedMessage {
        data: emptyMap()
    };
}

extends mutates fun set(self: SoraEncodedMessage, index: Int, value: Int?) {
    self.data.set(index, value);
}

message TONTransfer {
    assetId: Bytes32;
    soraAddress: Bytes32;
}

message RegisterJetton {
    assetId: Bytes32;
    name: String;
    symbol: String;
    decimals: Int as uint8;
}

message Migrate {
    newContract: Address;
}