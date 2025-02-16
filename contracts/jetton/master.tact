import "./traits";
import "./messages";
import "./errcodes";
import "./wallet";

// This is your custom jetton's master contract.
contract JettonMasterTemplate with JettonMaster {
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
}

@interface("org.ton.jetton.master")
trait JettonMaster with Common {
    owner: Address;
    staticTax: Int;
    lockedValue: Int;

    content: Cell;
    totalSupply: Int;
    mintable: Bool;

    // this is a non-standard method, it's used to mint new tokens to specified user.
    receive(msg: MintJetton) {
        self.receiveMintJetton(msg);
    }

    // this is a TEP-074 standard receiver method,
    // it's used to update the jetton total supply when burning tokens.
    receive(msg: TokenBurnNotification) {
        self.receiveBurnInternal(msg);
    }

    // this is a TEP-89 standard receiver method,
    // it's used to provide the wallet address of the specified owner.
    receive(msg: ProvideWalletAddress) {
        self.receiveProvideWalletAddress(msg);
    }

    // this is a TEP-074 standard getter method
    get fun get_jetton_data(): JettonMasterData {
        return self.getJettonData();
    }

    // this is a TEP-074 standard getter method,
    // generate the jetton wallet address for any user.
    get fun get_wallet_address(owner: Address): Address {
        return self.getWalletAddress(owner);
    }

    virtual fun getWalletAddress(owner: Address): Address {
        return contractAddress(self.getJettonWalletContract(owner));
    }

    virtual fun receiveProvideWalletAddress(msg: ProvideWalletAddress) {
        let walletAddr = self.get_wallet_address(msg.ownerAddress);

        self.reserveValue(0);
        send(SendParameters{
            to: sender(),
            value: 0,
            bounce: false,
            mode: SendRemainingBalance,
            body: TakeWalletAddress{
                queryId: msg.queryId,
                walletAddress: walletAddr,
                ownerAddress: msg.includeAddress ? msg.ownerAddress : null,
            }.toCell(),
        });
    }

    virtual fun getJettonWalletContract(owner: Address): StateInit {
        return initOf JettonWalletTemplate(myAddress(), owner);
    }

    virtual fun receiveBurnInternal(msg: TokenBurnNotification) {
        let ctx: Context = context();
        nativeThrowUnless(codeJettonBalanceInsufficient, self.totalSupply >= msg.amount);

        let walletAddr = self.get_wallet_address(msg.sender);
        nativeThrowUnless(codeUnauthorized, sender() == walletAddr);

        self.totalSupply -= msg.amount;

        // refund the excess TON to the sender.
        self.reserveValue(0);
        send(SendParameters{
            to: msg.responseDestination,
            value: 0,
            bounce: false,
            mode: SendRemainingBalance,
            body: Excesses{
                queryId: msg.queryId,
            }.toCell(),
        });
    }

    virtual fun receiveMintJetton(msg: MintJetton) {
        let ctx: Context = context();
        nativeThrowUnless(codeUnauthorized, ctx.sender == self.owner);
        nativeThrowUnless(codeNotMintable, self.mintable);
        nativeThrowUnless(codeAmountShouldBePositive, msg.amount > 0);
        nativeThrowUnless(codeInflowValueNotSufficient,
            ctx.value >= msg.forwardAmount + self.staticTax);

        self.totalSupply += msg.amount;
        let jettonWallet = self.getJettonWalletContract(msg.receiver);

        // deploy the wallet if it's not deployed yet,
        // then send the minted tokens to the wallet.
        self.reserveValue(0);
        send(SendParameters{
            to: contractAddress(jettonWallet),
            value: 0,
            bounce: false,
            mode: SendRemainingBalance,
            body: TokenTransferInternal{
                queryId: msg.queryId,
                amount: msg.amount,
                from: sender(),
                responseDestination: msg.responseDestination,
                forwardAmount: msg.forwardAmount,
                forwardPayload: msg.forwardPayload,
            }.toCell(),
            code: jettonWallet.code,
            data: jettonWallet.data
        });
    }

    virtual fun getJettonData(): JettonMasterData {
        return JettonMasterData{
            totalSupply: self.totalSupply,
            mintable: self.mintable,
            owner: self.owner,
            content: self.content,
            walletCode: self.getJettonWalletContract(myAddress()).code
        };
    }
}