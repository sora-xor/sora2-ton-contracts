import "./types.tact";

extends fun encode(self: SoraTransferMessage): SoraEncodedMessage {
    let returnMap = emptySoraEncodedMessage();

    let i = 0;
    let cursor = 0;
    while (i < 32) {
        returnMap.set(cursor, self.reciever.innerMap.get(i));
        cursor += 1;
        i += 1;
    }

    i = 0;
    while (i < 32) {
        returnMap.set(cursor, self.assetId.innerMap.get(i));
        cursor += 1;
        i += 1;
    }

    let amountBytes = self.amount.uint32ToLeBytes();
    i = 0;
    while (i < 4) {
        returnMap.set(cursor, self.assetId.innerMap.get(i));
        cursor += 1;
        i += 1;
    }

    return returnMap;
}

extends fun uint32ToLeBytes(self: Int): map<Int, Int as uint8> {
    let returnMap: map<Int, Int as uint8> = emptyMap();

    returnMap.set(0, (self >> 24) & 0xff);
    returnMap.set(1, (self >> 16) & 0xff); 
    returnMap.set(2, (self >> 8) & 0xff);
    returnMap.set(3, self & 0xff); 

    return returnMap;
}