import "./types.tact";

extends fun encode(self: SoraTransferMessage): SoraEncodedMessage {
    let builder: Builder = beginCell();

    let i = 0;
    while (i < 32) {
        builder = builder.storeUint(self.reciever.get(31 - i), 8);
        i += 1;
    }

    i = 0;
    while (i < 32) {
        builder = builder.storeUint(self.assetId.get(31 - i), 8);
        i += 1;
    }

    builder = builder.storeUint(self.amount & 0xff, 8)
        .storeUint((self.amount >> 8) & 0xff, 8)
        .storeUint((self.amount >> 16) & 0xff, 8)
        .storeUint((self.amount >> 24) & 0xff, 8);

    return newSoraEncodedMessage(builder.endCell());
}