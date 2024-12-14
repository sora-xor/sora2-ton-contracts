import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import { Channel } from "../wrappers/Channel";
import { Address, toNano } from "@ton/core";

export class TestChannel {
    channel: SandboxContract<Channel>;

    public get address() {
        return this.channel.address;
    }

    public get send() {
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

    constructor(channel: SandboxContract<Channel>) {
        this.channel = channel;
    }

    static async fromInit(blockchain: Blockchain, owner: Address, seqno: bigint): Promise<TestChannel> {
        const channel = blockchain.openContract(await Channel.fromInit(owner, seqno));
        return new TestChannel(channel);
    }

    async deploy(sender: SandboxContract<TreasuryContract>): Promise<void> {
        const deployResult = await this.channel.send(
            sender.getSender(),
            { value: toNano(1), },
            { $$type: 'Deploy', queryId: 0n, }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: sender.address,
            to: this.channel.address,
            deploy: true,
            success: true,
        });
    }

    async registerApp(sender: SandboxContract<TreasuryContract>, app: Address, success: boolean = true, exists: boolean = true): Promise<void> {
        const registerResult = await this.channel.send(
            sender.getSender(),
            { value: toNano(1), },
            {
                $$type: 'RegisterApp',
                app: app
            }
        );

        expect(registerResult.transactions).toHaveTransaction({
            from: sender.address,
            to: this.channel.address,
            success: success,
        });
        expect(await this.channel.getIsApp(app)).toBe(exists);
    }

    async removeApp(sender: SandboxContract<TreasuryContract>, app: Address, success: boolean = true, exists: boolean = false): Promise<void> {
        const registerResult = await this.channel.send(
            sender.getSender(),
            { value: toNano(1), },
            {
                $$type: 'RemoveApp',
                app: app
            }
        );

        expect(registerResult.transactions).toHaveTransaction({
            from: sender.address,
            to: this.channel.address,
            success: success,
        });
        expect(await this.channel.getIsApp(app)).toBe(exists);
    }
}
