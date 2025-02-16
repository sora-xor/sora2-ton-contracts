import "../primitives/common";

// SORA Messages
message SoraTokenBridgeInternal {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    recipient: Bytes32;
}

message SoraTokenBridgeNotification {
    queryId: Int as uint64;
    amount: Int as coins;
    sender: Address;
    recipient: Bytes32;
}

message SoraTokenBridge {
    queryId: Int as uint64;
    amount: Int as coins;
    recipient: Bytes32;
}

message SoraJettonDeploy {
    relayer: Address;
    collector: Address;
}