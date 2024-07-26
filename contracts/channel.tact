import "@stdlib/deploy";
import "@stdlib/ownable";
import "./bridge_call.tact";

message OutboundMessage {
    nonce: Int as uint64;
    message: SoraEncodedCall;
    source: Address;
}

message SendOutboundMessage {
    message: SoraEncodedCall;
    sender: Address;
}

message SendInboundMessage {
    target: Address;
    message: Cell;
}

message RegisterApp {
    app: Address;
}

message Reset {}

contract Channel with Deployable, OwnableTransferable {
    owner: Address;
    outboundNonce: Int as uint64 = 0;
    apps: map<Address, Bool>;
    init(){
        self.owner = sender();
    }
    
    get fun isApp(app: Address): Bool {
        return self.apps.get(app) == true;
    }
    
    get fun apps(): map<Address, Bool> {
        return self.apps;
    }

    get fun outboundNonce(): Int {
        return self.outboundNonce;
    }
    
    fun requireApp() {
        require(self.apps.get(context().sender) == true, "Only apps can send messages");
    }
    
    // Ensure that we have some amount of TON on this contract after execution
    fun ensureMinBalance() {
        nativeReserve(ton("0.1"), 0); 
    }
    
    receive(msg: SendOutboundMessage) {
        self.requireApp();
        self.ensureMinBalance();
        self.outboundNonce += 1;
        emit(OutboundMessage {
            nonce: self.outboundNonce,
            message: msg.message,
            source: context().sender,
        }.toCell());
        send(SendParameters {
            to: msg.sender,
            value: 0,
            mode: SendIgnoreErrors | SendRemainingBalance,
        });
    }
    
    receive(msg: RegisterApp) {
        self.requireOwner();
        self.ensureMinBalance();
        self.apps.set(msg.app, true);
        send(SendParameters {
            to: sender(),
            value: 0,
            mode: SendIgnoreErrors | SendRemainingBalance,
        });
    }
    
    receive(msg: Reset) {
        self.requireOwner();
        self.ensureMinBalance();
        self.outboundNonce = 0;
        send(SendParameters {
            to: sender(),
            value: 0,
            mode: SendIgnoreErrors | SendRemainingBalance,
        });
    }
    
    receive(msg: SendInboundMessage) {
        self.requireOwner();
        self.ensureMinBalance();
        require(self.apps.get(msg.target) == true, "Can only send messages to apps");
        send(
            SendParameters {
                to: msg.target,
                value: 0,
                mode: SendRemainingValue,
                body: msg.message
            }
        );
    }
}