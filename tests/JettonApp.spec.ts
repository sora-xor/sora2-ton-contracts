import { Blockchain, EventMessageSent, prettyLogTransactions, printTransactionFees, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, address, beginCell, Builder, Cell, safeSignVerify, toNano } from '@ton/core';
import '@ton/test-utils';
import assert from 'assert';
import { Channel, SoraEncodedCall, storeChangeOwner, storeInboundMessageInternal, storeMigrate, storeOutboundMessage, storeSendOutboundMessage } from '../wrappers/Channel';
import { TestChannel } from './TestChannel';
import { mnemonicNew, mnemonicToHDSeed, deriveEd25519Path } from '@ton/crypto';
import { Bytes32, JettonApp, LockJetton, SendTon, storeSoraJettonDeploy, storeLockJetton, storeLockJettonInternal, storeRegisterJetton, storeRegisterJettonInternal, storeRegisterSoraJetton, storeRegisterSoraJettonInternal, storeRegisterTon, storeRegisterTonInternal, storeSendTon, storeUnlockJetton, storeUnlockJettonInternal, UnlockJetton } from '../wrappers/JettonApp';
import { SoraJettonMaster, storeMintJetton, storeExcesses, storeTransferNotification, storeTokenTransfer, storeTokenTransferInternal, TokenTransfer, SoraTokenBridge, storeSoraTokenBridge, storeSoraTokenBridgeInternal, storeSoraTokenBridgeNotification } from '../wrappers/SoraJettonMaster';
import { deployContract, TransactionVisualizer } from './utils';
import { JettonWalletTemplate } from '../wrappers/JettonWallet';
import { JettonCollector } from '../wrappers/JettonCollector';
import { decodeAddress } from '@polkadot/util-crypto';
import { u8aToHex } from '@polkadot/util';
import { JettonMasterTemplate, storeTep64TokenData, Tep64TokenData } from '../wrappers/JettonMaster';
import { SoraJettonWallet } from '../wrappers/SoraJettonWallet';

const ALICE = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

function soraAddressToBigint(address: string): bigint {
    return BigInt(u8aToHex(decodeAddress(address)));
}

function buildBridgeTransferCall(master: Address, sender: Address, recipient: string, amount: bigint): SoraEncodedCall {
    const callPrefix = '0600';
    const encodedMaster = '0400' + master.toRawString().substring(2);
    const encodedSender = '0400' + sender.toRawString().substring(2);
    const encodedRecipient = u8aToHex(decodeAddress(recipient)).substring(2);
    const encodedAmount = amount.toString(16).padStart(32, '0');
    const encodedCall = callPrefix + encodedMaster + encodedSender + encodedRecipient + encodedAmount;
    return {
        $$type: "SoraEncodedCall",
        data: beginCell().storeBuffer(Buffer.from(encodedCall, 'hex')).asCell(),
    };
}

describe('JettonApp', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let relayer: SandboxContract<TreasuryContract>;
    let channel: TestChannel;
    let jettonApp: SandboxContract<JettonApp>;
    let jetton: SandboxContract<JettonMasterTemplate>;
    const TON_MASTER = new Address(0, Buffer.alloc(32, 0));
    const visualizer = new TransactionVisualizer();

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        blockchain.recordStorage = true;

        deployer = await blockchain.treasury('deployer');
        relayer = await blockchain.treasury('relayer');
        channel = await TestChannel.fromInit(blockchain, 0n, 5n);
        await channel.deploy(deployer);

        jettonApp = blockchain.openContract(await JettonApp.fromInit(channel.address, 0n));

        await deployContract(jettonApp, deployer);

        await channel.registerApp(deployer, jettonApp.address, true, true);

        jetton = blockchain.openContract(await JettonMasterTemplate.fromInit(deployer.address, {
            $$type: "Tep64TokenData",
            content: "USDT",
            flag: 1n,
        }));
        await deployContract(jetton, deployer);
        visualizer.addContract('Deployer', deployer);
        visualizer.addContract('Relayer', relayer);
        visualizer.addContract('Channel', channel);
        visualizer.addContract('JettonApp', jettonApp);
        visualizer.addContract('Jetton', jetton);
        visualizer.addContractName('TON_MASTER', TON_MASTER);
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and soraApp are ready to use
    });

    it('should register Jetton', async () => {
        const collector = await JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(jetton.address));
        const collectorWallet = await JettonWalletTemplate.fromAddress(await jetton.getGetWalletAddress(collector.address));
        visualizer.addContract('Collector(Jetton)', collector);
        visualizer.addContract('Collector(JettonWallet)', collectorWallet);
        const messageData = beginCell().store(storeRegisterJetton({
            $$type: "RegisterJetton",
            master: jetton.address,
            wallet: collectorWallet.address
        })).asCell();
        const before = blockchain.snapshot();
        const res = await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.2"),
                data: messageData,
            }]
        );
        const after = blockchain.snapshot();
        await visualizer.visualizeTransactions('RegisterJetton', res.transactions, before, after);
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeInboundMessageInternal({
                $$type: "InboundMessageInternal",
                msg: messageData,
                relayer: relayer.address
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: collector.address,
            deploy: true,
            success: true,
            body: beginCell().store(storeRegisterJettonInternal({
                $$type: "RegisterJettonInternal",
                relayer: relayer.address,
                wallet: collectorWallet.address,
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: relayer.address,
            success: true,
            body: beginCell().asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: relayer.address,
            success: true,
            body: beginCell().asCell()
        });
    });

    it('should register TON', async () => {
        const collector = await JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(TON_MASTER));
        visualizer.addContract('Collector(TON)', collector);
        const messageData = beginCell().store(storeRegisterTon({
            $$type: "RegisterTon",
        })).asCell();
        const before = blockchain.snapshot();
        const res = await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.1"),
                data: messageData,
            }]
        );
        const after = blockchain.snapshot();
        await visualizer.visualizeTransactions('RegisterTON', res.transactions, before, after);
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeInboundMessageInternal({
                $$type: "InboundMessageInternal",
                msg: messageData,
                relayer: relayer.address
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: collector.address,
            deploy: true,
            success: true,
            body: beginCell().store(storeRegisterTonInternal({
                $$type: "RegisterTonInternal",
                relayer: relayer.address,
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: relayer.address,
            success: true,
            body: beginCell().asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: relayer.address,
            success: true,
            body: beginCell().asCell()
        });
    });

    it('should register SORA Jetton', async () => {
        const content = {
            $$type: "Tep64TokenData",
            content: "XOR",
            flag: 1n
        } as Tep64TokenData;
        const soraJetton = SoraJettonMaster.fromAddress(await jettonApp.getGetSoraMasterAddress(content));
        const collector = JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(soraJetton.address));
        const collectorWallet = SoraJettonWallet.fromAddress(await jettonApp.getGetSoraWalletAddress(soraJetton.address, collector.address));
        visualizer.addContract('Collector(SoraJetton)', collector);
        visualizer.addContract('Collector(SoraJettonWallet)', collectorWallet);
        visualizer.addContract('SoraJetton', soraJetton);
        const assetId = BigInt(144);
        const messageData = beginCell().store(storeRegisterSoraJetton({
            $$type: "RegisterSoraJetton",
            content,
            assetId: {
                $$type: "Bytes32",
                data: assetId
            }
        })).asCell();
        const before = blockchain.snapshot();
        const res = await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.3"),
                data: messageData,
            }]
        );
        const after = blockchain.snapshot();
        prettyLogTransactions(res.transactions);
        await visualizer.visualizeTransactions('RegisterSORAJetton', res.transactions, before, after);
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeInboundMessageInternal({
                $$type: "InboundMessageInternal",
                msg: messageData,
                relayer: relayer.address
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: collector.address,
            deploy: true,
            success: true,
            body: beginCell().store(storeRegisterSoraJettonInternal({
                $$type: "RegisterSoraJettonInternal",
                relayer: relayer.address,
                wallet: collectorWallet.address,
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: soraJetton.address,
            deploy: true,
            success: true,
            body: beginCell().store(storeSoraJettonDeploy({
                $$type: "SoraJettonDeploy",
                collector: collector.address,
                relayer: relayer.address
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: soraJetton.address,
            to: relayer.address,
            success: true,
            body: beginCell().asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: relayer.address,
            success: true,
            body: beginCell().asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: relayer.address,
            success: true,
            body: beginCell().asCell()
        });
    });

    it('should transfer Jetton to SORA', async () => {
        const sender = await blockchain.treasury('sender');
        const collector = blockchain.openContract(JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(jetton.address)));
        const collectorWallet = blockchain.openContract(JettonWalletTemplate.fromAddress(await jetton.getGetWalletAddress(collector.address)));
        const senderWallet = blockchain.openContract(JettonWalletTemplate.fromAddress(await jetton.getGetWalletAddress(sender.address)));
        visualizer.addContract('Collector(Jetton)', collector);
        visualizer.addContract('Collector(JettonWallet)', collectorWallet);
        visualizer.addContract('Sender', sender);
        visualizer.addContract('Sender(JettonWallet)', senderWallet);
        {
            const before = blockchain.snapshot();
            let res = await channel.sendSignedMessages(
                relayer,
                { value: toNano(1) },
                [{
                    $$type: "InboundMessage",
                    target: jettonApp.address,
                    fee: toNano("0.1"),
                    data: beginCell().store(storeRegisterJetton({
                        $$type: "RegisterJetton",
                        master: jetton.address,
                        wallet: collectorWallet.address
                    })).asCell(),
                }]
            );
            const after = blockchain.snapshot();
            await visualizer.visualizeTransactions('SendJetton-Register', res.transactions, before, after);
        }
        {
            const before = blockchain.snapshot();
            const res = await jetton.send(deployer.getSender(), { value: toNano(1) }, {
                $$type: "MintJetton",
                receiver: sender.address,
                responseDestination: deployer.address,
                amount: toNano(100),
                queryId: 0n,
                forwardAmount: 0n,
                forwardPayload: null
            });
            const after = blockchain.snapshot();
            await visualizer.visualizeTransactions('SendJetton-Mint', res.transactions, before, after);
        }
        const soraAddress: Bytes32 = {
            $$type: "Bytes32",
            data: soraAddressToBigint(ALICE)
        };

        const lockJetton: LockJetton = {
            $$type: "LockJetton",
            address: soraAddress
        };

        const messageData: TokenTransfer = {
            $$type: "TokenTransfer",
            queryId: 1n,
            forwardPayload: beginCell().store(storeLockJetton(lockJetton)).asCell(),
            forwardAmount: toNano(0.1),
            amount: toNano(2),
            destination: collector.address,
            customPayload: null,
            responseDestination: sender.address
        };

        const before = blockchain.snapshot();
        const res = await senderWallet.send(sender.getSender(), { value: toNano(1) }, messageData);
        const after = blockchain.snapshot();
        await visualizer.visualizeTransactions('SendJetton', res.transactions, before, after);
        expect(res.transactions).toHaveTransaction({
            from: sender.address,
            to: senderWallet.address,
            success: true,
            body: beginCell().store(storeTokenTransfer(messageData)).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: collectorWallet.address,
            success: true,
            deploy: true,
            body: beginCell().store(storeTokenTransferInternal({
                $$type: "TokenTransferInternal",
                queryId: messageData.queryId,
                amount: messageData.amount,
                from: sender.address,
                responseDestination: messageData.responseDestination,
                forwardAmount: messageData.forwardAmount,
                forwardPayload: messageData.forwardPayload
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collectorWallet.address,
            to: collector.address,
            success: true,
            body: beginCell().store(storeTransferNotification({
                $$type: 'TransferNotification',
                amount: messageData.amount,
                queryId: messageData.queryId,
                sender: sender.address,
                forwardPayload: messageData.forwardPayload
            })).asCell(),
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeLockJettonInternal({
                $$type: "LockJettonInternal",
                amount: messageData.amount,
                recepient: soraAddress,
                sender: sender.address,
                master: jetton.address
            })).asCell(),
        });
        const encodedCall = buildBridgeTransferCall(jetton.address, sender.address, ALICE, messageData.amount);
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: channel.address,
            success: true,
            body: beginCell().store(storeSendOutboundMessage({
                $$type: "SendOutboundMessage",
                sender: sender.address,
                message: encodedCall
            })).asCell(),
        });
        expect(res.externals).toHaveLength(1);
        expect(res.externals.at(0)?.body).toEqualCell(beginCell().store(storeOutboundMessage({
            $$type: "OutboundMessage",
            message: encodedCall,
            nonce: 3n,
            source: jettonApp.address
        })).asCell());
    });

    it('should transfer TON to SORA', async () => {
        const sender = await blockchain.treasury('sender');
        const collector = blockchain.openContract(JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(TON_MASTER)));
        visualizer.addContract('Sender', sender);
        await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.1"),
                data: beginCell().store(storeRegisterTon({
                    $$type: "RegisterTon",
                })).asCell(),
            }]
        );
        const soraAddress: Bytes32 = {
            $$type: "Bytes32",
            data: soraAddressToBigint(ALICE)
        };

        const messageData: SendTon = {
            $$type: "SendTon",
            amount: toNano(1),
            soraAddress
        };
        const before = blockchain.snapshot();
        const res = await collector.send(sender.getSender(), { value: toNano(2) }, messageData);
        const after = blockchain.snapshot();
        await visualizer.visualizeTransactions('SendTON', res.transactions, before, after);
        expect(await collector.getLockedAmount()).toEqual(toNano(1));
        expect(res.transactions).toHaveTransaction({
            from: sender.address,
            to: collector.address,
            success: true,
            body: beginCell().store(storeSendTon(messageData)).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeLockJettonInternal({
                $$type: "LockJettonInternal",
                amount: toNano(1),
                recepient: soraAddress,
                sender: sender.address,
                master: TON_MASTER
            })).asCell(),
        });
        const encodedCall = buildBridgeTransferCall(TON_MASTER, sender.address, ALICE, toNano(1));
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: channel.address,
            success: true,
            body: beginCell().store(storeSendOutboundMessage({
                $$type: "SendOutboundMessage",
                sender: sender.address,
                message: encodedCall
            })).asCell(),
        });
        expect(res.externals).toHaveLength(1);
        expect(res.externals.at(0)?.body).toEqualCell(beginCell().store(storeOutboundMessage({
            $$type: "OutboundMessage",
            message: encodedCall,
            nonce: 3n,
            source: jettonApp.address
        })).asCell());
    });

    it('should receive SORA Jetton from SORA', async () => {
        const recipient = await blockchain.treasury('recipient');
        const content = {
            $$type: "Tep64TokenData",
            content: "XOR",
            flag: 1n
        } as Tep64TokenData;
        const soraJetton = SoraJettonMaster.fromAddress(await jettonApp.getGetSoraMasterAddress(content));
        const collector = JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(soraJetton.address));
        const recipientWallet = SoraJettonWallet.fromAddress(await jettonApp.getGetSoraWalletAddress(soraJetton.address, recipient.address));
        visualizer.addContract('Recipient(SoraJetton)', recipient);
        visualizer.addContract('Recipient(SoraJettonWallet)', recipientWallet);
        visualizer.addContract('Collector(SoraJetton)', collector);
        visualizer.addContract('SoraJetton', soraJetton);
        const assetId = BigInt(144);
        await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.3"),
                data: beginCell().store(storeRegisterSoraJetton({
                    $$type: "RegisterSoraJetton",
                    content,
                    assetId: {
                        $$type: "Bytes32",
                        data: assetId
                    }
                })).asCell(),
            }]
        );
        const messageData = beginCell().store(storeUnlockJetton({
            $$type: "UnlockJetton",
            master: soraJetton.address,
            recepient: recipient.address,
            amount: toNano(1.2),
        })).asCell();
        const before = blockchain.snapshot();
        const res = await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.2"),
                data: messageData,
            }]
        );
        const after = blockchain.snapshot();
        await visualizer.visualizeTransactions('ReceiveSORAJetton', res.transactions, before, after);
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeInboundMessageInternal({
                $$type: "InboundMessageInternal",
                msg: messageData,
                relayer: relayer.address
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: collector.address,
            success: true,
            body: beginCell().store(storeUnlockJettonInternal({
                $$type: "UnlockJettonInternal",
                relayer: relayer.address,
                recepient: recipient.address,
                amount: toNano(1.2),
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: soraJetton.address,
            success: true,
            body: beginCell().store(storeMintJetton({
                $$type: "MintJetton",
                amount: toNano(1.2),
                receiver: recipient.address,
                responseDestination: relayer.address,
                forwardAmount: 0n,
                forwardPayload: null,
                queryId: 0n
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: soraJetton.address,
            to: recipientWallet.address,
            success: true,
            deploy: true,
            body: beginCell().store(storeTokenTransferInternal({
                $$type: "TokenTransferInternal",
                amount: toNano(1.2),
                from: collector.address,
                queryId: 0n,
                responseDestination: relayer.address,
                forwardAmount: 0n,
                forwardPayload: null
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: recipientWallet.address,
            to: relayer.address,
            success: true,
            body: beginCell().store(storeExcesses({
                $$type: "Excesses",
                queryId: 0n
            })).asCell()
        });
    });

    it('should transfer SORA Jetton to SORA', async () => {
        const content = {
            $$type: "Tep64TokenData",
            content: "XOR",
            flag: 1n
        } as Tep64TokenData;
        const sender = await blockchain.treasury('sender');
        const soraJetton = SoraJettonMaster.fromAddress(await jettonApp.getGetSoraMasterAddress(content));
        const collector = JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(soraJetton.address));
        const senderWallet = blockchain.openContract(SoraJettonWallet.fromAddress(await jettonApp.getGetSoraWalletAddress(soraJetton.address, sender.address)));
        const collectorWallet = SoraJettonWallet.fromAddress(await jettonApp.getGetSoraWalletAddress(soraJetton.address, collector.address));
        visualizer.addContract('Sender(SoraJetton)', sender);
        visualizer.addContract('Sender(SoraJettonWallet)', senderWallet);
        visualizer.addContract('Collector(SoraJetton)', collector);
        visualizer.addContract('Collector(SoraJettonWallet)', collectorWallet);
        visualizer.addContract('SoraJetton', soraJetton);
        const assetId = BigInt(144);
        await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.3"),
                data: beginCell().store(storeRegisterSoraJetton({
                    $$type: "RegisterSoraJetton",
                    content,
                    assetId: {
                        $$type: "Bytes32",
                        data: assetId
                    }
                })).asCell(),
            }]
        );
        await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.2"),
                data: beginCell().store(storeUnlockJetton({
                    $$type: "UnlockJetton",
                    master: soraJetton.address,
                    recepient: sender.address,
                    amount: toNano(2.2),
                })).asCell(),
            }]
        );
        const soraAddress: Bytes32 = {
            $$type: "Bytes32",
            data: soraAddressToBigint(ALICE)
        };

        const messageData: SoraTokenBridge = {
            $$type: "SoraTokenBridge",
            queryId: 1n,
            amount: toNano(2),
            recipient: soraAddress,
        };

        const before = blockchain.snapshot();
        const res = await senderWallet.send(sender.getSender(), { value: toNano(1) }, messageData);
        const after = blockchain.snapshot();
        await visualizer.visualizeTransactions('SendSoraJetton', res.transactions, before, after);
        expect(res.transactions).toHaveTransaction({
            from: sender.address,
            to: senderWallet.address,
            success: true,
            body: beginCell().store(storeSoraTokenBridge(messageData)).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: senderWallet.address,
            to: soraJetton.address,
            success: true,
            body: beginCell().store(storeSoraTokenBridgeInternal({
                $$type: "SoraTokenBridgeInternal",
                queryId: messageData.queryId,
                amount: messageData.amount,
                sender: sender.address,
                recipient: soraAddress,
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: soraJetton.address,
            to: collector.address,
            success: true,
            body: beginCell().store(storeSoraTokenBridgeNotification({
                $$type: 'SoraTokenBridgeNotification',
                amount: messageData.amount,
                queryId: messageData.queryId,
                sender: sender.address,
                recipient: soraAddress,
            })).asCell(),
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeLockJettonInternal({
                $$type: "LockJettonInternal",
                amount: messageData.amount,
                recepient: soraAddress,
                sender: sender.address,
                master: soraJetton.address
            })).asCell(),
        });
        const encodedCall = buildBridgeTransferCall(soraJetton.address, sender.address, ALICE, messageData.amount);
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: channel.address,
            success: true,
            body: beginCell().store(storeSendOutboundMessage({
                $$type: "SendOutboundMessage",
                sender: sender.address,
                message: encodedCall
            })).asCell(),
        });
        expect(res.externals).toHaveLength(1);
        expect(res.externals.at(0)?.body).toEqualCell(beginCell().store(storeOutboundMessage({
            $$type: "OutboundMessage",
            message: encodedCall,
            nonce: 5n,
            source: jettonApp.address
        })).asCell());
    });

    it('should receive TON from SORA', async () => {
        const recipient = await blockchain.treasury('recipient');
        const collector = blockchain.openContract(JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(TON_MASTER)));
        visualizer.addContract('Recipient', recipient);
        visualizer.addContract('Collector(TON)', collector);
        await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.1"),
                data: beginCell().store(storeRegisterTon({
                    $$type: "RegisterTon",
                })).asCell(),
            }]
        );
        const soraAddress: Bytes32 = {
            $$type: "Bytes32",
            data: soraAddressToBigint(ALICE)
        };

        await collector.send(recipient.getSender(), { value: toNano(2) }, {
            $$type: "SendTon",
            amount: toNano(1),
            soraAddress
        });
        expect(await collector.getLockedAmount()).toEqual(toNano(1));
        const messageData: UnlockJetton = {
            $$type: "UnlockJetton",
            master: TON_MASTER,
            recepient: recipient.address,
            amount: toNano(0.5),
        };
        const before = blockchain.snapshot();
        const res = await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.2"),
                data: beginCell().store(storeUnlockJetton(messageData)).asCell(),
            }]
        );
        const after = blockchain.snapshot();
        await visualizer.visualizeTransactions('ReceiveTON', res.transactions, before, after);
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeInboundMessageInternal({
                $$type: "InboundMessageInternal",
                msg: beginCell().store(storeUnlockJetton(messageData)).asCell(),
                relayer: relayer.address
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: collector.address,
            success: true,
            body: beginCell().store(storeUnlockJettonInternal({
                $$type: "UnlockJettonInternal",
                relayer: relayer.address,
                recepient: recipient.address,
                amount: toNano(0.5),
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: recipient.address,
            success: true,
            body: beginCell().asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: relayer.address,
            success: true,
            body: beginCell().asCell()
        });
    });

    it('should receive Jetton from SORA', async () => {
        const recipient = await blockchain.treasury('recipient');
        const collector = blockchain.openContract(JettonCollector.fromAddress(await jettonApp.getGetCollectorAddress(jetton.address)));
        const collectorWallet = blockchain.openContract(JettonWalletTemplate.fromAddress(await jetton.getGetWalletAddress(collector.address)));
        const recipientWallet = blockchain.openContract(JettonWalletTemplate.fromAddress(await jetton.getGetWalletAddress(recipient.address)));
        visualizer.addContract('Recipient', recipient);
        visualizer.addContract('Collector(Jetton)', collector);
        visualizer.addContract('Collector(JettonWallet)', collectorWallet);
        visualizer.addContract('Recipient(JettonWallet)', recipientWallet);

        await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.1"),
                data: beginCell().store(storeRegisterJetton({
                    $$type: "RegisterJetton",
                    master: jetton.address,
                    wallet: collectorWallet.address
                })).asCell(),
            }]
        );
        await jetton.send(deployer.getSender(), { value: toNano(1) }, {
            $$type: "MintJetton",
            receiver: recipient.address,
            responseDestination: deployer.address,
            amount: toNano(100),
            queryId: 0n,
            forwardAmount: 0n,
            forwardPayload: null
        });


        const soraAddress: Bytes32 = {
            $$type: "Bytes32",
            data: soraAddressToBigint(ALICE)
        };

        const lockJetton: LockJetton = {
            $$type: "LockJetton",
            address: soraAddress
        };

        await recipientWallet.send(recipient.getSender(), { value: toNano(1) }, {
            $$type: "TokenTransfer",
            queryId: 1n,
            forwardPayload: beginCell().store(storeLockJetton(lockJetton)).asCell(),
            forwardAmount: toNano(0.1),
            amount: toNano(2),
            destination: collector.address,
            customPayload: null,
            responseDestination: recipient.address
        });

        expect(await collector.getLockedAmount()).toEqual(toNano(2));
        const messageData: UnlockJetton = {
            $$type: "UnlockJetton",
            master: jetton.address,
            recepient: recipient.address,
            amount: toNano(0.5),
        };
        const before = blockchain.snapshot();
        const res = await channel.sendSignedMessages(
            relayer,
            { value: toNano(1) },
            [{
                $$type: "InboundMessage",
                target: jettonApp.address,
                fee: toNano("0.2"),
                data: beginCell().store(storeUnlockJetton(messageData)).asCell(),
            }]
        );
        const after = blockchain.snapshot();
        await visualizer.visualizeTransactions('ReceiveJetton', res.transactions, before, after);
        expect(res.transactions).toHaveTransaction({
            from: channel.address,
            to: jettonApp.address,
            success: true,
            body: beginCell().store(storeInboundMessageInternal({
                $$type: "InboundMessageInternal",
                msg: beginCell().store(storeUnlockJetton(messageData)).asCell(),
                relayer: relayer.address
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: jettonApp.address,
            to: collector.address,
            success: true,
            body: beginCell().store(storeUnlockJettonInternal({
                $$type: "UnlockJettonInternal",
                relayer: relayer.address,
                recepient: recipient.address,
                amount: toNano(0.5),
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collector.address,
            to: collectorWallet.address,
            success: true,
            body: beginCell().store(storeTokenTransfer({
                $$type: "TokenTransfer",
                queryId: 0n,
                destination: recipient.address,
                responseDestination: relayer.address,
                customPayload: null,
                forwardAmount: 0n,
                forwardPayload: null,
                amount: toNano(0.5),
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: collectorWallet.address,
            to: recipientWallet.address,
            success: true,
            body: beginCell().store(storeTokenTransferInternal({
                $$type: "TokenTransferInternal",
                queryId: 0n,
                from: collector.address,
                responseDestination: relayer.address,
                forwardAmount: 0n,
                forwardPayload: null,
                amount: toNano(0.5),
            })).asCell()
        });
        expect(res.transactions).toHaveTransaction({
            from: recipientWallet.address,
            to: relayer.address,
            success: true,
            body: beginCell().store(storeExcesses({
                $$type: "Excesses",
                queryId: 0n,
            })).asCell()
        });
    });

});
