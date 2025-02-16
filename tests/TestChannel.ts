import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { Channel, Commitment, InboundMessage, RegisterApp, RemoveApp, SendInboundMessages, SendParameters, Signature, storeCommitment, storeRegisterApp, storeRemoveApp } from "../wrappers/Channel";
import { Address, beginCell, Cell, Dictionary, Sender, toNano } from "@ton/core";
import { mnemonicNew, sign, mnemonicToHDSeed, deriveEd25519Path, keyPairFromSeed, deriveED25519HardenedKey, KeyPair } from '@ton/crypto';
import { deployContract, SendParams } from "./utils";

export class TestChannel {
    channel: SandboxContract<Channel>;
    peers: KeyPair[];

    public get address() {
        return this.channel.address;
    }

    public get abi() {
        return this.channel.abi;
    }

    public async sendSigned(sender: SandboxContract<TreasuryContract>, opts: SendParams, commitment: Commitment, peers = this.peers.length) {
        const hash = beginCell().store(storeCommitment(commitment)).asCell().hash();
        const sigs = this.peers.slice(0, peers)
            .map((peer) => [peer.publicKey, sign(hash, peer.secretKey)]).map(([publicKey, signature]) => {
                return {
                    $$type: "Signature",
                    publicKey: BigInt('0x' + publicKey.toString('hex')),
                    signature: beginCell().storeBuffer(signature).asSlice()
                } as Signature;
            }).reduce((dict, sig, id) => dict.set(id, sig), Dictionary.empty<number, Signature>());
        const msg = {
            $$type: "SendInboundMessages",
            commitment,
            proof: {
                $$type: "CommitmentProof",
                sigs
            }
        } as SendInboundMessages;
        return await this.channel.send(sender.getSender(), opts, msg);
    }

    public async sendSignedMessages(sender: SandboxContract<TreasuryContract>, opts: SendParams, msgs: InboundMessage[], totalFee?: bigint, nonce?: bigint, peers = this.peers.length) {
        nonce = nonce ?? (await this.channel.getInboundNonce() + 1n);
        totalFee = totalFee ?? (msgs.reduce((total_fee, msg) => msg.fee + total_fee, 0n) + toNano("0.2"));
        const messages = msgs.reduce((dict, msg, id) => dict.set(id, msg), Dictionary.empty<number, InboundMessage>())
        return this.sendSigned(sender, opts, {
            $$type: "Commitment",
            messages,
            nonce,
            totalFee
        }, peers);
    }

    public get sendRaw() {
        return this.channel.send;
    }

    public get getOutboundNonce() {
        return this.channel.getOutboundNonce;
    }

    public get getApps() {
        return this.channel.getApps;
    }

    public get getIsApp() {
        return this.channel.getIsApp;
    }

    public get getStopped() {
        return this.channel.getStopped;
    }

    constructor(channel: SandboxContract<Channel>, peers: KeyPair[]) {
        this.channel = channel;
        this.peers = peers;
    }

    static async fromInit(blockchain: Blockchain, seqno: bigint, peers: bigint): Promise<TestChannel> {
        var peers_dict = Dictionary.empty();
        var peers_keys = [];
        const mnemonic = await mnemonicNew();
        const seed = await mnemonicToHDSeed(mnemonic);
        for (var i = 0; i < peers; i++) {
            const derivedSeed = await deriveEd25519Path(seed, [i]);
            const keyPair = keyPairFromSeed(derivedSeed);
            const pk = BigInt('0x' + keyPair.publicKey.toString('hex'));
            peers_dict.set(pk, true);
            peers_keys.push(keyPair);
        }
        const channel = blockchain.openContract(await Channel.fromInit(seqno, peers_dict as Dictionary<bigint, boolean>, null));
        return new TestChannel(channel, peers_keys);
    }

    async deploy(sender: SandboxContract<TreasuryContract>): Promise<void> {
        await deployContract(this.channel, sender);
    }

    async registerApp(sender: SandboxContract<TreasuryContract>, app: Address, success: boolean = true, exists: boolean = true): Promise<void> {
        const result = await this.sendSignedMessages(
            sender,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: this.address,
                fee: toNano("0.1"),
                data: beginCell().store(storeRegisterApp({
                    $$type: "RegisterApp",
                    app
                })).asCell()
            }]
        );

        expect(result.transactions).toHaveTransaction({
            from: sender.address,
            to: this.channel.address,
            success: true,
        });

        expect(result.transactions).toHaveTransaction({
            from: this.channel.address,
            to: this.channel.address,
            success: success,
        });
        expect(await this.channel.getIsApp(app)).toBe(exists);
    }

    async removeApp(sender: SandboxContract<TreasuryContract>, app: Address, success: boolean = true, exists: boolean = false): Promise<void> {
        const result = await this.sendSignedMessages(
            sender,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: this.address,
                fee: toNano("0.1"),
                data: beginCell().store(storeRemoveApp({
                    $$type: "RemoveApp",
                    app
                })).asCell()
            }]
        );

        expect(result.transactions).toHaveTransaction({
            from: sender.address,
            to: this.channel.address,
            success: true,
        });

        expect(result.transactions).toHaveTransaction({
            from: this.channel.address,
            to: this.channel.address,
            success: success,
        });
        expect(await this.channel.getIsApp(app)).toBe(exists);
    }
}
