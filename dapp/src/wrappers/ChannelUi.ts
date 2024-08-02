import { Address, Cell, Contract, ContractABI, ContractProvider, Sender, toNano } from '@ton/core';
import * as wrapper from './Channel';

export class ChannelUi implements Contract {

    static async init(owner: Address) {
        return await wrapper.Channel.init(owner);
    }

    static async fromInit(owner: Address) {
        return new ChannelUi(await wrapper.Channel.fromInit(owner));
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

    async sendInboundMessage(provider: ContractProvider, via: Sender, target: Address, message: Cell, value: bigint = toNano("0.1")) {
        this.app.send(provider, via, { value }, {
            $$type: "SendInboundMessage",
            target,
            message
        });
    }

    async sendDeploy(provider: ContractProvider, via: Sender, queryId: bigint) {
        this.app.send(provider, via, { value: toNano("0.1") }, {
            $$type: "Deploy",
            queryId
        });
    }

    async sendChangeOwner(provider: ContractProvider, via: Sender, newOwner: Address, queryId: bigint) {
        this.app.send(provider, via, { value: toNano("0.1") }, {
            $$type: "ChangeOwner",
            newOwner,
            queryId
        });
    }

    async getIsApp(provider: ContractProvider, app: Address): Promise<boolean> {
        return await this.app.getIsApp(provider, app);
    }

    async getApps(provider: ContractProvider): Promise<Address[]> {
        return (await this.app.getApps(provider)).keys();
    }

    async getOutboundNonce(provider: ContractProvider): Promise<bigint> {
        return await this.app.getOutboundNonce(provider);
    }

    async getOwner(provider: ContractProvider): Promise<Address> {
        return await this.app.getOwner(provider);
    }
}