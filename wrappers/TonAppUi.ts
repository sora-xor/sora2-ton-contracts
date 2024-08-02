import { Address, Cell, Contract, ContractABI, ContractProvider, Sender, toNano } from '@ton/core';
import * as wrapper from './TonApp';

export class TonAppUi implements Contract {
    static async init(channel: Address) {
        return await wrapper.TonApp.init(channel);
    }

    static async fromInit(channel: Address) {
        const app = await wrapper.TonApp.fromInit(channel);
        return new TonAppUi(app);
    }

    static fromAddress(address: Address) {
        return new TonAppUi(wrapper.TonApp.fromAddress(address));
    }

    static createFromAddress(address: Address) {
        return TonAppUi.fromAddress(address);
    }

    readonly app: wrapper.TonApp;
    readonly address: Address;
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI;

    private constructor(app: wrapper.TonApp) {
        this.app = app;
        this.address = app.address;
        this.init = app.init;
        this.abi = app.abi;
    }

    async sendTon(provider: ContractProvider, via: Sender, recepient: string, amount: bigint) {
        await this.app.send(provider, via, { value: amount + toNano("0.1") }, {
            $$type: "SendTon",
            amount,
            soraAddress: {
                $$type: "Bytes32",
                data: BigInt(recepient)
            }

        });
    }

    async sendMigrate(provider: ContractProvider, via: Sender, receiver: Address) {
        await this.app.send(provider, via, { value: toNano("0.1") }, { $$type: "Migrate", receiver });
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

    async getLockedAmount(provider: ContractProvider): Promise<bigint> {
        return await this.app.getLockedAmount(provider);
    }

    async getIsStopped(provider: ContractProvider): Promise<boolean> {
        return await this.app.getIsStopped(provider);
    }

    async getOwner(provider: ContractProvider): Promise<Address> {
        return await this.app.getOwner(provider);
    }
}