import "./types.tact";

extends fun encode(self: SoraTransferMessage): SoraEncodedMessage {
    let returnMap = emptySoraEncodedMessage();

    let i = 0;
    let cursor = 0;
    while (i < 32) {
        returnMap.set(cursor, self.reciever.get(i));
        cursor += 1;
        i += 1;
    }

    i = 0;
    while (i < 32) {
        returnMap.set(cursor, self.assetId.get(i));
        cursor += 1;
        i += 1;
    }
    
    // SoraTransferMessage.amount le bytes set
    returnMap.set(cursor + 1, (self.amount >> 24) & 0xff);
    returnMap.set(cursor + 2, (self.amount >> 16) & 0xff); 
    returnMap.set(cursor + 3, (self.amount >> 8) & 0xff);
    returnMap.set(cursor + 4, self.amount & 0xff); 

    return returnMap;
}
