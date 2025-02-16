import "@stdlib/ownable";

import "./messages";
import "./wallet";
import "../jetton/master";
import "../jetton/wallet";

contract SoraJettonMaster with JettonMaster {
    owner: Address;
    staticTax: Int as coins = ton("0.001");
    lockedValue: Int as coins = 0;

    // Cell to store arbitrary data related to the jetton
    //
    // https://github.com/ton-blockchain/TEPs/blob/master/text/0064-token-data-standard.md#jetton-metadata-example-offchain
    content: Cell;
    // Total number of tokens in existence.
    totalSupply: Int as coins;
    mintable: Bool;

    init(owner: Address, content: Tep64TokenData) {
        self.owner = owner;

        self.content = content.toCell();
        self.totalSupply = 0;
        self.mintable = true;
    }

    receive(msg: SoraJettonDeploy) {
        nativeThrowUnless(codeUnauthorized, sender() == self.owner);
        self.owner = msg.collector;

        // refund the excess TON to the sender.
        self.reserveValue(0);
        send(SendParameters{
            to: msg.relayer,
            value: 0,
            bounce: false,
            mode: SendRemainingBalance,
            body: emptyCell(),
        });
    }

    receive(msg: SoraTokenBridgeInternal) {
        let ctx: Context = context();
        nativeThrowUnless(codeJettonBalanceInsufficient, self.totalSupply >= msg.amount);

        let walletAddr = self.get_wallet_address(msg.sender);
        nativeThrowUnless(codeUnauthorized, ctx.sender == walletAddr);

        self.totalSupply -= msg.amount;

        // refund the excess TON to the sender.
        self.reserveValue(0);
        send(SendParameters{
            to: self.owner,
            value: 0,
            bounce: false,
            mode: SendRemainingBalance,
            body: SoraTokenBridgeNotification{
                queryId: msg.queryId,
                amount: msg.amount,
                sender: msg.sender,
                recipient: msg.recipient,
            }.toCell(),
        });

    }

    override fun getJettonWalletContract(owner: Address): StateInit {
        return initOf SoraJettonWallet(myAddress(), owner);
    }
}
