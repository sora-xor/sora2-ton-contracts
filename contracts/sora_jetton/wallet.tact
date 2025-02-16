import "@stdlib/ownable";

import "./messages";
import "../jetton/master";
import "../jetton/wallet";

contract SoraJettonWallet with JettonWallet {
    // owner is the address of the user who owns the wallet.
    owner: Address;
    // master is the address of the master contract that deployed this wallet.
    master: Address;
    // balance is the number of tokens that the wallet currently holds.
    // unlike the centralized ledger of Ethereum Tokens,
    // TON users keep track of the number of tokens they own in their own wallets.
    balance: Int;
    // staticTax is the fee that will be charged for each transaction.
    staticTax: Int as coins = ton("0.001");
    lockedValue: Int as coins = 0;

    // The parameters of the init function should not be too complex,
    // as it will be called frequently when generating the jetton wallet address.
    init(master: Address, owner: Address) {
        self.balance = 0;
        self.owner = owner;
        self.master = master;
    }

    override fun getJettonWalletContract(owner: Address): StateInit {
        return initOf SoraJettonWallet(self.master, owner);
    }

    // this is a TEP-074 standard receiver method
    receive(msg: SoraTokenBridge) {
        let ctx: Context = context();
        nativeThrowUnless(codeUnauthorized, ctx.sender == self.owner);
        nativeThrowUnless(codeBalanceNotSufficient, self.balance >= msg.amount);
        nativeThrowUnless(codeAmountShouldBePositive, msg.amount > 0);

        // Update balance
        self.balance -= msg.amount;

        // notify master to update totalSupply
        self.reserveValue(0);
        send(SendParameters{
            to: self.master,
            value: 0,
            mode: SendRemainingBalance,
            bounce: true,
            body: SoraTokenBridgeInternal{
                queryId: msg.queryId,
                amount: msg.amount,
                sender: self.owner,
                recipient: msg.recipient,
            }.toCell(),
        });
    }
}