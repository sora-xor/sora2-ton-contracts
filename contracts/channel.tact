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

struct InboundMessage {
    target: Address;
    data: Cell;
    fee: Int;
}

message SendInboundMessages {
    commitment: Commitment;
    proof: CommitmentProof;
}

struct Commitment {
    nonce: Int as uint64;
    total_fee: Int;
    messages: map<Int as uint16, InboundMessage>;
}

struct Signature {
    public_key: Int;
    signature: Slice
}

struct CommitmentProof {
    sigs: map<Int as uint16, Signature>;
}

extends fun verify(self: CommitmentProof, data_hash: Int, required_signatures: Int): Bool {
    let checked: Int = 0;
    foreach (_, sig in self.sigs) {
        if checkSignature(data_hash, sig.signature, sig.public_key) {
            checked += 1;
        } else {
            return false;
        }
    }
    if checked < required_signatures {
        return false;
    }
    return true;
}

message RegisterApp {
    app: Address;
}

message Reset {
    peers: map<Int, Bool>;
}

contract Channel with Deployable, OwnableTransferable {
    override const storageReserve: Int = ton("0.01");
    owner: Address;
    outboundNonce: Int as uint64 = 0;
    inboundNonce: Int as uint64 = 0;
    apps: map<Address, Bool>;
    peers: map<Int, Bool>;
    peers_count: Int as uint16 = 0;

    init(owner: Address, peers: map<Int, Bool>) {
        require(sender() == owner, "Only owner can initialize this contract");
        self.owner = owner;
        self.peers = peers;
        foreach (peer, _ in peers) {
            self.peers.set(peer, true);
            self.peers_count += 1;
        }
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
        require(self.apps.get(sender()) == true, "Only apps can send messages");
    }
    
    fun threshold(): Int {
        return self.peers_count - ((self.peers_count - 1) / 3);
    }
    
    fun verifyProof(commitment_hash: Int, proof: CommitmentProof) {
        let checked: Int = 0;
        foreach (_, sig in proof.sigs) {
            require(self.peers.get(sig.public_key) == true, "Invalid peer public key");
            require(checkSignature(commitment_hash, sig.signature, sig.public_key), "Invalid signature");
            checked += 1;
        }
        require(checked >= self.threshold(), "Not enough signatures");
    }
    
    receive(msg: SendOutboundMessage) {
        self.requireApp();
        self.outboundNonce += 1;
        emit(OutboundMessage {
            nonce: self.outboundNonce,
            message: msg.message,
            source: sender(),
        }.toCell());
        self.forward(msg.sender, null, false, null);
    }
    
    receive(msg: RegisterApp) {
        self.requireOwner();
        self.apps.set(msg.app, true);
        self.notify(null);
    }
    
    receive(msg: Reset) {
        self.requireOwner();
        self.outboundNonce = 0;
        self.inboundNonce = 0;
        self.peers = emptyMap();
        self.peers_count = 0;
        foreach (peer, _ in msg.peers) {
            self.peers.set(peer, true);
            self.peers_count += 1;
        }
        self.notify(null);
    }
    
    receive(msg: SendInboundMessages) {
        require(self.inboundNonce + 1 == msg.commitment.nonce, "Invalid commitment nonce");
        let commitment_hash: Int = msg.commitment.toCell().hash();
        self.verifyProof(commitment_hash, msg.proof);
        self.inboundNonce += 1;
        foreach (_, message in msg.commitment.messages) {
            send(SendParameters {
                to: message.target,
                value: message.fee,
                body: message.data,
                mode: SendIgnoreErrors
            })
        }
    }
}