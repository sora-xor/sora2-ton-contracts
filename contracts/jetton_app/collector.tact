import "@stdlib/ownable";
import "@stdlib/deploy";
import "./messages";
import "../traits/reserve_fee";
import "../sora_jetton/messages";

contract JettonCollector with Deployable, Ownable, ReserveFee {
    override const minTonsForStorage: Int = ton("0.01");
    const minFee: Int = ton("0.05");
    owner: Address;
    wallet: Address?;
    master: Address;
    owned: Bool = false;
    active: Bool = false;
    lockedAmount: Int as uint128 = 0;
    
    get fun lockedAmount(): Int {
        return self.lockedAmount;
    }

    get fun master(): Address {
        return self.master;
    }

    get fun wallet(): Address? {
        return self.wallet;
    }

    get fun isActive(): Bool {
        return self.active;
    }

    get fun isOwned(): Bool {
        return self.owned;
    }

    init(owner: Address, master: Address){
        require(sender() == owner, "Only owner can init this contract");
        self.owner = owner;
        self.master = master;
    }
    
    fun requireActive() {
        require(self.active, "Wallet should be active");
    }

    fun requireNotActive() {
        require(!self.active, "Wallet should not be active");
    }

    fun requireWallet() {
        require(sender() == self.wallet, "Only wallet can send this message");
    }

    fun requireMaster() {
        require(sender() == self.master, "Only master can send this message");
    }

    fun requireJetton() {
        require(self.master != tonAddress, "Not a Jetton collector");
        require(!self.owned, "Not a Jetton collector");
        self.requireWallet();
    }

    fun requireTon() {
        require(self.master == tonAddress, "Not a TON collector");
    }

    fun requireSoraJetton() {
        require(self.master != tonAddress, "Not a SORA Jetton collector");
        require(self.owned, "Not a SORA Jetton collector");
        self.requireMaster();
    }

    receive(msg: RegisterJettonInternal) {
        self.requireOwner();
        self.requireNotActive();
        self.reserveStorageFee();
        self.active = true;
        self.wallet = msg.wallet;
        self.forwardBalanceIgnoreErrors(msg.relayer, null);
    }

    receive(msg: RegisterTonInternal) {
        self.requireOwner();
        self.requireNotActive();
        self.reserveStorageFee();
        self.active = true;
        self.forwardBalanceIgnoreErrors(msg.relayer, null);
    }
    
    receive(msg: RegisterSoraJettonInternal) {
        self.requireOwner();
        self.requireNotActive();
        self.reserveStorageFee();
        self.active = true;
        self.wallet = msg.wallet;
        self.owned = true;
        self.forwardBalanceIgnoreErrors(msg.relayer, null);
    }
    
    receive(msg: TransferNotification) {
        self.requireActive();
        self.requireJetton();
        self.reserveStorageFee();
        let msgInner = msg.forwardPayload!!.asSlice().tryLoadLockJetton();
        if (msgInner == null) {
            /// Try to return funds without checks, but if there's not enough fee, 
            /// money will stuck on this contract. There's nothing else we can do
            self.forwardBalance(self.wallet!!, TokenTransfer {
                queryId: msg.queryId,
                amount: msg.amount,
                responseDestination: msg.sender,
                destination: msg.sender,
                customPayload: null,
                forwardAmount: 0,
                forwardPayload: null,
            }.toCell());
        } else {
            let ctx = context();
            self.requireFee(ctx.value, msgInner!!.getSubmitFee(ctx), msgInner!!.getProcessingFee(ctx));
            self.lockedAmount += msg.amount;
            self.forwardBalance(self.owner, LockJettonInternal {
                master: self.master,
                sender: msg.sender,
                recepient: msgInner!!.address,
                amount: msg.amount
            }.toCell());
        }
    }

    receive(msg: SoraTokenBridgeNotification) {
        self.requireActive();
        self.requireSoraJetton();
        self.reserveStorageFee();
        require(self.lockedAmount >= msg.amount, "Not enough locked amount");
        self.lockedAmount -= msg.amount;
        self.forwardBalance(self.owner, LockJettonInternal {
            master: self.master,
            sender: msg.sender,
            recepient: msg.recipient,
            amount: msg.amount
        }.toCell());
    }
    
    receive(msg: UnlockJettonInternal) {
        self.requireActive();
        self.requireOwner();
        self.reserveStorageFee();
        if (self.master == tonAddress) {
            require(self.lockedAmount >= msg.amount, "Not enough locked amount");
            self.lockedAmount -= msg.amount;
            nativeReserve(self.lockedAmount, 0);
            send(SendParameters {
                to: msg.recepient,
                value: msg.amount,
                mode: SendBounceIfActionFail
            });
            self.forwardBalance(msg.relayer, null);
        } else if (self.owned) {
            self.lockedAmount += msg.amount;
            self.forwardBalance(self.master, MintJetton {
                queryId: 0,
                receiver: msg.recepient,
                amount: msg.amount,
                responseDestination: msg.relayer,
                forwardAmount: 0,
                forwardPayload: null,
            }.toCell());
        } else {
            require(self.lockedAmount >= msg.amount, "Not enough locked amount");
            self.lockedAmount -= msg.amount;
            self.forwardBalance(self.wallet!!, TokenTransfer {
                queryId: 0,
                amount: msg.amount,
                destination: msg.recepient,
                responseDestination: msg.relayer,
                forwardAmount: 0,
                forwardPayload: null,
                customPayload: null,
            }.toCell());
        }
    }

    receive(msg: MigrateCollector) {
        self.requireActive();
        self.requireOwner();
        if (self.master == tonAddress) {
            self.forwardBalance(msg.relayer, MigrateTon {
                relayer: msg.relayer,
                amount: self.lockedAmount,
            }.toCell());
        } else if (self.owned) {
            self.forwardBalance(self.master, ChangeOwner {
                queryId: 0,
                newOwner: msg.collector,
            }.toCell());
        } else {
            self.forwardBalance(self.wallet!!, TokenTransfer {
                queryId: 0,
                amount: self.lockedAmount,
                destination: msg.collector,
                responseDestination: msg.relayer,
                forwardAmount: 0,
                forwardPayload: null,
                customPayload: null,
            }.toCell());
        }
        self.lockedAmount = 0;
        self.active = false;
    }
    
    bounced(msg: bounced<TokenTransfer>) {
        if (self.active) {
            self.lockedAmount += msg.amount;
        } else {
            self.active = true;
            self.lockedAmount = msg.amount;
        }
    }
    
    bounced(msg: bounced<MintJetton>) {
        if (self.active) {
            self.lockedAmount -= msg.amount;
        } else {
            self.active = true;
            self.lockedAmount = msg.amount;
        }
    }
    
    // lock TON to send it to SORA
    receive(msg: SendTon){
        self.requireTon();
        self.reserveStorageFee();
        let ctx = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.lockedAmount += msg.amount;
        nativeReserve(self.lockedAmount, 0);
        self.forwardBalance(self.owner, LockJettonInternal {
            master: self.master,
            sender: ctx.sender,
            recepient: msg.soraAddress,
            amount: msg.amount
        }.toCell());
    }
}