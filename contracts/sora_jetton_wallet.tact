import "@stdlib/deploy";
import "./types.tact";
import "./scale_codec.tact";

contract SoraJettonWallet with Deployable {

    // owner: Address;
    parent: Address;
    balance: Int as uint128;

    // // Sora Asset Mapping
    soraAssetId: Bytes32;

    // // Asset Details
    name: String;
    symbol: String;
    precision: Int as uint8;


    init(parent: Address) {
        self.parent = parent;
        self.balance = 0;

        // Pre Register Data:
        self.soraAssetId = newBytes32();
        self.name = "";
        self.symbol = "";
        self.precision = 0;
    }

    receive(msg: RegisterJetton) {
        require(context().sender == self.parent, "Only parent can register a jetton");

        self.soraAssetId = msg.assetId;
        self.name = msg.name;
        self.symbol = msg.symbol;
        self.precision = msg.decimals;
    }
}
