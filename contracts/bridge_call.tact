import "./sora_primitives.tact";
struct SoraTransferMessage {
    token: Address;
    sender: Address;
    recipient: Bytes32;
    amount: Balance;
}
struct SoraEncodedCall {
    data: Cell;
}

fun newEncodedCall(data: Cell): SoraEncodedCall {
    return SoraEncodedCall{data: data};
}

extends fun encode(self: SoraTransferMessage): SoraEncodedCall {
    let builder: Builder = beginCell();
    builder = builder.storeUint(0x0600, 16);
    builder = builder.storeAlignedAddress(self.token);
    builder = builder.storeAlignedAddress(self.sender);
    builder = builder.storeBytes32(self.recipient);
    builder = builder.storeBalance(self.amount);
    return newEncodedCall(builder.endCell());
}