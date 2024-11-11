import { Address, Cell, Contract, ContractABI, ContractProvider, Dictionary, Sender, Slice, toNano } from '@ton/core';
import * as wrapper from './Channel';

export class Message {
    readonly data: Cell;
    readonly fee: bigint;
    readonly target: Address;

    constructor(target: Address, data: Cell, fee: bigint) {
        this.target = target;
        this.data = data;
        this.fee = fee;
    }

    toInternal(): wrapper.InboundMessage {
        return {
            $$type: "InboundMessage",
            data: this.data,
            fee: this.fee,
            target: this.target
        };
    }
}

export class Commitment {
    readonly totalFee: bigint;
    readonly nonce: bigint;
    readonly messages: Message[];

    constructor(total_fee: bigint, nonce: bigint, messages: Message[]) {
        this.totalFee = total_fee;
        this.nonce = nonce;
        this.messages = messages;
    }

    toInternal(): wrapper.Commitment {
        var messages = Dictionary.empty();
        var count = 0;
        for (const message of this.messages) {
            messages.set(count, message.toInternal());
            count += 1;

        }
        return {
            $$type: "Commitment",
            total_fee: this.totalFee,
            nonce: this.nonce,
            messages: messages as Dictionary<number, wrapper.InboundMessage>,
        };
    }
}

export class Signature {
    readonly signature: Slice;
    readonly publicKey: bigint;

    constructor(signature: Slice, publicKey: bigint) {
        this.signature = signature;
        this.publicKey = publicKey;
    }

    toInternal(): wrapper.Signature {
        return {
            $$type: "Signature",
            signature: this.signature,
            public_key: this.publicKey
        }
    }
}

export class Proof {
    readonly signatures: Signature[];

    constructor(signatures: Signature[]) {
        this.signatures = signatures;
    }

    toInternal(): wrapper.CommitmentProof {
        var count = 0;
        var signatures = Dictionary.empty();
        for (const signature of this.signatures) {
            signatures.set(count, signature.toInternal());
            count += 1;
        }
        return {
            $$type: "CommitmentProof",
            sigs: signatures as Dictionary<number, wrapper.Signature>
        }
    }
}

export class ChannelUi implements Contract {
    static async init(seqno: bigint, peers: bigint[]) {
        var peers_dict = Dictionary.empty();
        for (const peer of peers) {
            peers_dict.set(peer, true);
        }
        return await wrapper.Channel.init(seqno, peers_dict as Dictionary<bigint, boolean>);
    }

    static async fromInit(seqno: bigint, peers: bigint[]) {
        var peers_dict = Dictionary.empty();
        for (const peer of peers) {
            peers_dict.set(peer, true);
        }
        return new ChannelUi(await wrapper.Channel.fromInit(seqno, peers_dict as Dictionary<bigint, boolean>));
    }

    static fromAddress(address: Address) {
        return new ChannelUi(wrapper.Channel.fromAddress(address));
    }

    static createFromAddress(address: Address) {
        return ChannelUi.fromAddress(address);
    }

    readonly app: wrapper.Channel;
    readonly address: Address;
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI;

    private constructor(app: wrapper.Channel) {
        this.app = app;
        this.address = app.address;
        this.init = app.init;
        this.abi = app.abi;
    }

    async sendRegisterApp(provider: ContractProvider, via: Sender, app: Address) {
        this.app.send(provider, via, { value: toNano("0.1") }, {
            $$type: "RegisterApp",
            app
        });
    }

    async sendInboundMessages(provider: ContractProvider, via: Sender, commitment: Commitment, proof: Proof, value: bigint = toNano("0.1")) {
        this.app.send(provider, via, { value }, {
            $$type: "SendInboundMessages",
            commitment: commitment.toInternal(),
            proof: proof.toInternal(),
        });
    }

    async sendDeploy(provider: ContractProvider, via: Sender, queryId: bigint) {
        this.app.send(provider, via, { value: toNano("0.1") }, {
            $$type: "Deploy",
            queryId
        });
    }

    async getIsApp(provider: ContractProvider, app: Address): Promise<boolean> {
        return await this.app.getIsApp(provider, app);
    }

    async getApps(provider: ContractProvider): Promise<Address[]> {
        return (await this.app.getApps(provider)).apps.keys();
    }

    async getOutboundNonce(provider: ContractProvider): Promise<bigint> {
        return await this.app.getOutboundNonce(provider);
    }
}