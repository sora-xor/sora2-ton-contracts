import "./sora_primitives.tact";

struct SoraTransferMessage {
    sender: Bytes32;
    reciever: Bytes32;
    assetId: Bytes32;
    amount: Int;
}

extends fun isValid(self: SoraTransferMessage): Bool {
    return self.sender.isValid() && self.reciever.isValid() && self.assetId.isValid();
}

message TONTransfer {
    assetId: Bytes32;
    soraAddress: Bytes32;
}

extends fun isValid(self: TONTransfer): Bool {
    return self.assetId.isValid() && self.soraAddress.isValid();
}
