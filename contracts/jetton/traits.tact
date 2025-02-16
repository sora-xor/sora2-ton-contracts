import "@stdlib/ownable";
import "@stdlib/deploy";

import "./errcodes.tact";
import "./messages.tact";

// The native sha256 in Tact truncates the input, computing only the first 128 bytes.
// Using fullSha256 allows computing the complete sha256 value.
//
// - https://github.com/tact-lang/tact/issues/1056
// - https://docs.tact-lang.org/book/assembly-functions/#onchainsha256
fun fullSha256(data: String): Int {
    _onchainShaPush(data);
    while (_onchainShaShouldProceed()) {
        _onchainShaOperate();
    }
    return _onchainShaHashExt();
}

// Helper assembly functions,
// each manipulating the stack in their own ways
// in different parts of the `fullSha256()` function
asm fun _onchainShaPush(data: String) { ONE }
asm fun _onchainShaShouldProceed(): Bool { OVER SREFS 0 NEQINT }
asm fun _onchainShaOperate() { OVER LDREF s0 POP CTOS s0 s1 XCHG INC }
asm fun _onchainShaHashExt(): Int { HASHEXT_SHA256 }

trait Txable {
    owner: Address;
    // staticTax is the tax fee that is charged for each transaction.
    // the tax fee will be saved in the contract's balance.
    staticTax: Int;

    receive(msg: SetStaticTax) {
        self.receiveSetStaticTax(msg);
    }

    get fun staticTax(): Int {
        return self.staticTax;
    }

    virtual fun receiveSetStaticTax(msg: SetStaticTax) {
        nativeThrowUnless(codeUnauthorized, sender() == self.owner);

        self.staticTax = msg.staticTax;
        let answer = beginString()
            .concat("set static tax fee to ")
            .concat(msg.staticTax.toString())
            .toString();
        self.reply(answer.asComment());
    }
}

// Common is the common trait that contains some common and useful traits.
trait Common with Txable, Deployable {
    owner: Address;
    staticTax: Int;
    // lockedValue is the value that is locked in the contract,
    // can not be withdrawn by the owner.
    lockedValue: Int;

    // default to forward excesses to the owner
    receive(msg: Excesses) {
        self.receiveExcesses(msg);
    }

    // this is a non-standard method,
    // allows the owner to withdraw unlocked balances
    receive("withdraw") {
        self.receiveWithdraw();
    }

    get fun tonBalance(): Int {
        return myBalance();
    }

    virtual fun receiveWithdraw() {
        let ctx: Context = context();
        nativeThrowUnless(codeUnauthorized, ctx.sender == self.owner);
        nativeThrowUnless(codeBalanceNotSufficient,
            myBalance() > (self.lockedValue + self.staticTax));

        // if there is some locked value in the contract,
        // should reserve the balance a little more than the locked value.
        if (self.lockedValue != 0) {
            nativeReserve(self.lockedValue + self.staticTax, ReserveExact);
        }

        send(SendParameters{
                to: self.owner,
                value: 0,
                mode: SendRemainingBalance,
                bounce: false,
                body: Excesses{queryId: 0}.toCell()
            }
        );
    }

    // can be used to reserve the balance for SendRemainingBalance.
    // default to reserve the balance before current transaction plus staticTax.
    //
    // if lockedValue has been increased, the delta should be positive.
    virtual fun reserveValue(delta: Int) {
        let ctx = context();
        let val = max((myBalance() - ctx.value) + self.staticTax, self.lockedValue + self.staticTax);
        nativeReserve(val + delta, ReserveExact);
    }

    virtual fun receiveExcesses(msg: Excesses) {
        self.reserveValue(0);
        send(SendParameters{
                to: self.owner,
                bounce: false,
                value: 0,
                mode: SendRemainingBalance,
                body: msg.toCell(),
            }
        );
    }
}
