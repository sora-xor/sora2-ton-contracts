import "./sora_primitives.tact";

struct SoraTransferMessage {
    reciever: Bytes32;
    assetId: Bytes32;
    amount: Int;
}

struct SoraEncodedMessage {
    data: Cell;
}

fun newSoraEncodedMessage(data: Cell): SoraEncodedMessage {
    return SoraEncodedMessage {
        data: data
    };
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