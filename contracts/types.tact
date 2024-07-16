import "./sora_primitives.tact";

struct SoraTransferMessage {
    reciever: Bytes32;
    assetId: Bytes32;
    amount: Int;
}

extends fun isValid(self: SoraTransferMessage): Bool {
    return self.reciever.isValid() && self.assetId.isValid();
}

struct SoraEncodedMessage {
    data: map<Int, Int as uint8>;
}

fun emptySoraEncodedMessage(): SoraEncodedMessage {
    return SoraEncodedMessage {
        data: emptyMap()
    };
}

extends fun set(self: SoraEncodedMessage, index: Int, value: Int?) {
    self.data.set(index, value);
}

message TONTransfer {
    assetId: Bytes32;
    soraAddress: Bytes32;
}

extends fun isValid(self: TONTransfer): Bool {
    return self.assetId.isValid() && self.soraAddress.isValid();
}

message RegisterJetton {
    assetId: Bytes32;
    name: String;
    symbol: String;
    decimals: Int as uint8;
}

message JettonTransfer {
    
}

message Migrate {
    newContract: Address;
}