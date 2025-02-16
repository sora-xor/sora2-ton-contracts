// This file is part of the SORA network and Polkaswap app.

// Copyright (c) 2020, 2021, Polka Biome Ltd. All rights reserved.
// SPDX-License-Identifier: BSD-4-Clause

// Redistribution and use in source and binary forms, with or without modification,
// are permitted provided that the following conditions are met:

// Redistributions of source code must retain the above copyright notice, this list
// of conditions and the following disclaimer.
// Redistributions in binary form must reproduce the above copyright notice, this
// list of conditions and the following disclaimer in the documentation and/or other
// materials provided with the distribution.
//
// All advertising materials mentioning features or use of this software must display
// the following acknowledgement: This product includes software developed by Polka Biome
// Ltd., SORA, and Polkaswap.
//
// Neither the name of the Polka Biome Ltd. nor the names of its contributors may be used
// to endorse or promote products derived from this software without specific prior written permission.

// THIS SOFTWARE IS PROVIDED BY Polka Biome Ltd. AS IS AND ANY EXPRESS OR IMPLIED WARRANTIES,
// INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Polka Biome Ltd. BE LIABLE FOR ANY
// DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
// STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE
// USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import "@stdlib/ownable";
import "@stdlib/deploy";
import "./messages";
import "../channel/external";
import "../jetton/messages";
import "../sora_jetton/master";
import "../sora_jetton/wallet";
import "../sora_jetton/messages";
import "../traits/reserve_fee";
import "./collector";

// Jetton app master contract
contract JettonApp with Deployable, OwnableTransferable, ReserveFee {
    override const minTonsForStorage: Int = ton("0.01");
    owner: Address; // Channel
    active: Bool = true;

    init(channel: Address, seqno: Int) {
        self.owner = channel;
    }
    
    get fun getCollectorAddress(master: Address): Address {
        return contractAddress(self.getCollector(master));
    }
    
    get fun getSoraMasterAddress(content: Tep64TokenData): Address {
        return contractAddress(self.getSoraMaster(content));
    }
    
    get fun getSoraWalletAddress(master: Address, owner: Address): Address {
        return contractAddress(self.getSoraWallet(master, owner));
    }
    
    fun getSoraWallet(master: Address, owner: Address): StateInit {
        return initOf SoraJettonWallet(master, owner);
    }
    
    fun getSoraMaster(content: Tep64TokenData): StateInit {
        return initOf SoraJettonMaster(myAddress(), content);
    }
    
    fun getCollector(master: Address): StateInit {
        return initOf JettonCollector(myAddress(), master);
    }
    
    fun requireCollector(master: Address) {
        let sinit = self.getCollector(master);
        require(contractAddress(sinit) == sender(), "Invalid sender!");
    }

    fun requireActive() {
        require(self.active, "Could not transfer during migration");
    }

    fun requireNotActive() {
        require(!self.active, "Only available during migration");
    }
    
    receive(msg: InboundMessageInternal) {
        self.requireOwner();
        self.reserveStorageFee();
        try {
            self.processInboundMessage(msg.msg.asSlice(), msg.relayer);
        } catch (e) {
            dump("Inbound message error");
            dump(e);
            self.forwardBalanceIgnoreErrors(msg.relayer, null);
        }
    }
    
    fun processInboundMessage(rawMsg: Slice, relayer: Address) {
        if (self.processUnlockJetton(rawMsg, relayer)) {
            return;
        }
        if (self.processRegisterJetton(rawMsg, relayer)) {
            return;
        }
        if (self.processRegisterSoraJetton(rawMsg, relayer)) {
            return;
        }
        if (self.processRegisterSoraJettonSimple(rawMsg, relayer)) {
            return;
        }
        if (self.processRegisterTon(rawMsg, relayer)) {
            return;
        }
        if (self.processStartMigration(rawMsg, relayer)) {
            return;
        }
        require(false, "Unknown message");
    }

    fun processRegisterSoraJettonSimple(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadRegisterSoraJettonSimple();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Register SORA Jetton");
        self.requireActive();
        let ctx: Context = context();
        let jettonFee = msg.getJettonFee(ctx);
        let collectorFee = msg.getCollectorFee(ctx);
        self.requireFee(ctx.value, jettonFee + collectorFee + msg.getChannelFee(ctx), msg.getProcessingFee(ctx));
        let masterInit = self.getSoraMaster(msg.content);
        let master = contractAddress(masterInit);
        let collectorInit = self.getCollector(master);
        let collector = contractAddress(collectorInit);
        let wallet = contractAddress(self.getSoraWallet(master, collector));
        send(SendParameters {
            to: master,
            value: jettonFee,
            mode: SendBounceIfActionFail | SendPayGasSeparately,
            body: SoraJettonDeploy {
                relayer: relayer,
                collector: collector,
            }.toCell(),
            code: masterInit.code,
            data: masterInit.data
        });
        send(SendParameters {
            to: collector,
            value: collectorFee,
            mode: SendBounceIfActionFail | SendPayGasSeparately,
            body: RegisterSoraJettonInternal {
                relayer: relayer,
                wallet: wallet,
            }.toCell(),
            code: collectorInit.code,
            data: collectorInit.data
        });
        self.forwardBalance(self.owner, SendOutboundMessage {
            message: SoraJettonRegistered {
                master: master,
                assetId: msg.assetId,
            }.encode(),
            sender: relayer,
        }.toCell());
        return true;
    }
    
    fun processUnlockJetton(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadUnlockJetton();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Unlock Jetton");
        self.requireActive();
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.forwardBalance(contractAddress(self.getCollector(msg.master)), UnlockJettonInternal{
            relayer: relayer,
            recepient: msg.recepient,
            amount: msg.amount,
        }.toCell());
        return true;
    }

    fun processRegisterJetton(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadRegisterJetton();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Register Jetton");
        self.requireActive();
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        let sinit = self.getCollector(msg.master);
        send(SendParameters {
            to: contractAddress(sinit),
            value: 0,
            mode: SendRemainingBalance | SendBounceIfActionFail,
            body: RegisterJettonInternal {
                relayer: relayer,
                wallet: msg.wallet,
            }.toCell(),
            code: sinit.code,
            data: sinit.data
        });
        return true;
    }

    fun processRegisterSoraJetton(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadRegisterSoraJetton();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Register SORA Jetton");
        self.requireActive();
        let ctx: Context = context();
        let jettonFee = msg.getJettonFee(ctx);
        let collectorFee = msg.getCollectorFee(ctx);
        self.requireFee(ctx.value, jettonFee + collectorFee + msg.getChannelFee(ctx), msg.getProcessingFee(ctx));
        let masterInit = self.getSoraMaster(msg.content);
        let master = contractAddress(masterInit);
        let collectorInit = self.getCollector(master);
        let collector = contractAddress(collectorInit);
        let wallet = contractAddress(self.getSoraWallet(master, collector));
        send(SendParameters {
            to: master,
            value: jettonFee,
            mode: SendBounceIfActionFail | SendPayGasSeparately,
            body: SoraJettonDeploy {
                relayer: relayer,
                collector: collector,
            }.toCell(),
            code: masterInit.code,
            data: masterInit.data
        });
        send(SendParameters {
            to: collector,
            value: collectorFee,
            mode: SendBounceIfActionFail | SendPayGasSeparately,
            body: RegisterSoraJettonInternal {
                relayer: relayer,
                wallet: wallet,
            }.toCell(),
            code: collectorInit.code,
            data: collectorInit.data
        });
        self.forwardBalance(self.owner, SendOutboundMessage {
            message: SoraJettonRegistered {
                master: master,
                assetId: msg.assetId,
            }.encode(),
            sender: relayer,
        }.toCell());
        return true;
    }

    fun processRegisterTon(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadRegisterTon();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Register TON");
        self.requireActive();
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        let sinit = self.getCollector(tonAddress);
        send(SendParameters {
            to: contractAddress(sinit),
            value: 0,
            mode: SendRemainingBalance | SendBounceIfActionFail,
            body: RegisterTonInternal {
                relayer: relayer,
            }.toCell(),
            code: sinit.code,
            data: sinit.data
        });
        return true;
    }
    
    fun processStartMigration(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadStartMigration();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Start migration");
        self.requireActive();
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.active = false;
        self.forwardBalanceIgnoreErrors(relayer, null);
        return true;
    }
    
    fun processMigrateCollector(rawMsg: Slice, relayer: Address): Bool {
        let maybeMsg = rawMsg.tryLoadMigrateCollector();
        if (maybeMsg == null) {
            return false;
        }
        let msg = maybeMsg!!;
        dump("Migrate collector");
        self.requireNotActive();
        let ctx: Context = context();
        self.requireFee(ctx.value, msg.getFee(ctx), msg.getProcessingFee(ctx));
        self.forwardBalance(contractAddress(self.getCollector(msg.master)), MigrateCollectorInternal{
            collector: msg.collector
        }.toCell());
        return true;
    }

    // Send locked token to SORA
    receive(msg: LockJettonInternal){
        self.requireCollector(msg.master);
        self.reserveStorageFee();
        let soraMessage: SoraTransferMessage = SoraTransferMessage{
            token: msg.master,
            recipient: msg.recepient,
            sender: msg.sender,
            amount: msg.amount
        };
        self.forwardBalance(self.owner, SendOutboundMessage {
            message: soraMessage.encode(),
            sender: msg.sender,
        }.toCell());
    }
    
}
