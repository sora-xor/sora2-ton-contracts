import { 
    Cell,
    Slice, 
    Address, 
    Builder, 
    beginCell, 
    ComputeError, 
    TupleItem, 
    TupleReader, 
    Dictionary, 
    contractAddress, 
    ContractProvider, 
    Sender, 
    Contract, 
    ContractABI, 
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function loadTupleDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function storeTupleDeploy(source: Deploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function loadTupleDeployOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function storeTupleDeployOk(source: DeployOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function loadTupleFactoryDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

function storeTupleFactoryDeploy(source: FactoryDeploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

function loadTupleChangeOwner(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

function storeTupleChangeOwner(source: ChangeOwner) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

function loadTupleChangeOwnerOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type SoraTransferMessage = {
    $$type: 'SoraTransferMessage';
    token: Address;
    sender: Address;
    recipient: Bytes32;
    amount: bigint;
}

export function storeSoraTransferMessage(src: SoraTransferMessage) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.token);
        b_0.storeAddress(src.sender);
        b_0.store(storeBytes32(src.recipient));
        let b_1 = new Builder();
        b_1.storeInt(src.amount, 257);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadSoraTransferMessage(slice: Slice) {
    let sc_0 = slice;
    let _token = sc_0.loadAddress();
    let _sender = sc_0.loadAddress();
    let _recipient = loadBytes32(sc_0);
    let sc_1 = sc_0.loadRef().beginParse();
    let _amount = sc_1.loadIntBig(257);
    return { $$type: 'SoraTransferMessage' as const, token: _token, sender: _sender, recipient: _recipient, amount: _amount };
}

function loadTupleSoraTransferMessage(source: TupleReader) {
    let _token = source.readAddress();
    let _sender = source.readAddress();
    const _recipient = loadTupleBytes32(source.readTuple());
    let _amount = source.readBigNumber();
    return { $$type: 'SoraTransferMessage' as const, token: _token, sender: _sender, recipient: _recipient, amount: _amount };
}

function storeTupleSoraTransferMessage(source: SoraTransferMessage) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.token);
    builder.writeAddress(source.sender);
    builder.writeTuple(storeTupleBytes32(source.recipient));
    builder.writeNumber(source.amount);
    return builder.build();
}

function dictValueParserSoraTransferMessage(): DictionaryValue<SoraTransferMessage> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSoraTransferMessage(src)).endCell());
        },
        parse: (src) => {
            return loadSoraTransferMessage(src.loadRef().beginParse());
        }
    }
}

export type SoraTonTransferMessage = {
    $$type: 'SoraTonTransferMessage';
    sender: Address;
    recipient: Bytes32;
    amount: bigint;
}

export function storeSoraTonTransferMessage(src: SoraTonTransferMessage) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.sender);
        b_0.store(storeBytes32(src.recipient));
        b_0.storeInt(src.amount, 257);
    };
}

export function loadSoraTonTransferMessage(slice: Slice) {
    let sc_0 = slice;
    let _sender = sc_0.loadAddress();
    let _recipient = loadBytes32(sc_0);
    let _amount = sc_0.loadIntBig(257);
    return { $$type: 'SoraTonTransferMessage' as const, sender: _sender, recipient: _recipient, amount: _amount };
}

function loadTupleSoraTonTransferMessage(source: TupleReader) {
    let _sender = source.readAddress();
    const _recipient = loadTupleBytes32(source.readTuple());
    let _amount = source.readBigNumber();
    return { $$type: 'SoraTonTransferMessage' as const, sender: _sender, recipient: _recipient, amount: _amount };
}

function storeTupleSoraTonTransferMessage(source: SoraTonTransferMessage) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.sender);
    builder.writeTuple(storeTupleBytes32(source.recipient));
    builder.writeNumber(source.amount);
    return builder.build();
}

function dictValueParserSoraTonTransferMessage(): DictionaryValue<SoraTonTransferMessage> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSoraTonTransferMessage(src)).endCell());
        },
        parse: (src) => {
            return loadSoraTonTransferMessage(src.loadRef().beginParse());
        }
    }
}

export type SoraEncodedCall = {
    $$type: 'SoraEncodedCall';
    data: Cell;
}

export function storeSoraEncodedCall(src: SoraEncodedCall) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.data);
    };
}

export function loadSoraEncodedCall(slice: Slice) {
    let sc_0 = slice;
    let _data = sc_0.loadRef();
    return { $$type: 'SoraEncodedCall' as const, data: _data };
}

function loadTupleSoraEncodedCall(source: TupleReader) {
    let _data = source.readCell();
    return { $$type: 'SoraEncodedCall' as const, data: _data };
}

function storeTupleSoraEncodedCall(source: SoraEncodedCall) {
    let builder = new TupleBuilder();
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSoraEncodedCall(): DictionaryValue<SoraEncodedCall> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSoraEncodedCall(src)).endCell());
        },
        parse: (src) => {
            return loadSoraEncodedCall(src.loadRef().beginParse());
        }
    }
}

export type Bytes32 = {
    $$type: 'Bytes32';
    data: bigint;
}

export function storeBytes32(src: Bytes32) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(src.data, 256);
    };
}

export function loadBytes32(slice: Slice) {
    let sc_0 = slice;
    let _data = sc_0.loadUintBig(256);
    return { $$type: 'Bytes32' as const, data: _data };
}

function loadTupleBytes32(source: TupleReader) {
    let _data = source.readBigNumber();
    return { $$type: 'Bytes32' as const, data: _data };
}

function storeTupleBytes32(source: Bytes32) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.data);
    return builder.build();
}

function dictValueParserBytes32(): DictionaryValue<Bytes32> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBytes32(src)).endCell());
        },
        parse: (src) => {
            return loadBytes32(src.loadRef().beginParse());
        }
    }
}

export type OutboundMessage = {
    $$type: 'OutboundMessage';
    nonce: bigint;
    message: SoraEncodedCall;
    source: Address;
}

export function storeOutboundMessage(src: OutboundMessage) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(4290871469, 32);
        b_0.storeUint(src.nonce, 64);
        b_0.store(storeSoraEncodedCall(src.message));
        b_0.storeAddress(src.source);
    };
}

export function loadOutboundMessage(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 4290871469) { throw Error('Invalid prefix'); }
    let _nonce = sc_0.loadUintBig(64);
    let _message = loadSoraEncodedCall(sc_0);
    let _source = sc_0.loadAddress();
    return { $$type: 'OutboundMessage' as const, nonce: _nonce, message: _message, source: _source };
}

function loadTupleOutboundMessage(source: TupleReader) {
    let _nonce = source.readBigNumber();
    const _message = loadTupleSoraEncodedCall(source.readTuple());
    let _source = source.readAddress();
    return { $$type: 'OutboundMessage' as const, nonce: _nonce, message: _message, source: _source };
}

function storeTupleOutboundMessage(source: OutboundMessage) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.nonce);
    builder.writeTuple(storeTupleSoraEncodedCall(source.message));
    builder.writeAddress(source.source);
    return builder.build();
}

function dictValueParserOutboundMessage(): DictionaryValue<OutboundMessage> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeOutboundMessage(src)).endCell());
        },
        parse: (src) => {
            return loadOutboundMessage(src.loadRef().beginParse());
        }
    }
}

export type SendOutboundMessage = {
    $$type: 'SendOutboundMessage';
    message: SoraEncodedCall;
    sender: Address;
}

export function storeSendOutboundMessage(src: SendOutboundMessage) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1127084417, 32);
        b_0.store(storeSoraEncodedCall(src.message));
        b_0.storeAddress(src.sender);
    };
}

export function loadSendOutboundMessage(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1127084417) { throw Error('Invalid prefix'); }
    let _message = loadSoraEncodedCall(sc_0);
    let _sender = sc_0.loadAddress();
    return { $$type: 'SendOutboundMessage' as const, message: _message, sender: _sender };
}

function loadTupleSendOutboundMessage(source: TupleReader) {
    const _message = loadTupleSoraEncodedCall(source.readTuple());
    let _sender = source.readAddress();
    return { $$type: 'SendOutboundMessage' as const, message: _message, sender: _sender };
}

function storeTupleSendOutboundMessage(source: SendOutboundMessage) {
    let builder = new TupleBuilder();
    builder.writeTuple(storeTupleSoraEncodedCall(source.message));
    builder.writeAddress(source.sender);
    return builder.build();
}

function dictValueParserSendOutboundMessage(): DictionaryValue<SendOutboundMessage> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendOutboundMessage(src)).endCell());
        },
        parse: (src) => {
            return loadSendOutboundMessage(src.loadRef().beginParse());
        }
    }
}

export type SendInboundMessage = {
    $$type: 'SendInboundMessage';
    target: Address;
    message: Cell;
}

export function storeSendInboundMessage(src: SendInboundMessage) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1152483916, 32);
        b_0.storeAddress(src.target);
        b_0.storeRef(src.message);
    };
}

export function loadSendInboundMessage(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1152483916) { throw Error('Invalid prefix'); }
    let _target = sc_0.loadAddress();
    let _message = sc_0.loadRef();
    return { $$type: 'SendInboundMessage' as const, target: _target, message: _message };
}

function loadTupleSendInboundMessage(source: TupleReader) {
    let _target = source.readAddress();
    let _message = source.readCell();
    return { $$type: 'SendInboundMessage' as const, target: _target, message: _message };
}

function storeTupleSendInboundMessage(source: SendInboundMessage) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.target);
    builder.writeCell(source.message);
    return builder.build();
}

function dictValueParserSendInboundMessage(): DictionaryValue<SendInboundMessage> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendInboundMessage(src)).endCell());
        },
        parse: (src) => {
            return loadSendInboundMessage(src.loadRef().beginParse());
        }
    }
}

export type RegisterApp = {
    $$type: 'RegisterApp';
    app: Address;
}

export function storeRegisterApp(src: RegisterApp) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(645895175, 32);
        b_0.storeAddress(src.app);
    };
}

export function loadRegisterApp(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 645895175) { throw Error('Invalid prefix'); }
    let _app = sc_0.loadAddress();
    return { $$type: 'RegisterApp' as const, app: _app };
}

function loadTupleRegisterApp(source: TupleReader) {
    let _app = source.readAddress();
    return { $$type: 'RegisterApp' as const, app: _app };
}

function storeTupleRegisterApp(source: RegisterApp) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.app);
    return builder.build();
}

function dictValueParserRegisterApp(): DictionaryValue<RegisterApp> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRegisterApp(src)).endCell());
        },
        parse: (src) => {
            return loadRegisterApp(src.loadRef().beginParse());
        }
    }
}

export type Reset = {
    $$type: 'Reset';
}

export function storeReset(src: Reset) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1431274889, 32);
    };
}

export function loadReset(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1431274889) { throw Error('Invalid prefix'); }
    return { $$type: 'Reset' as const };
}

function loadTupleReset(source: TupleReader) {
    return { $$type: 'Reset' as const };
}

function storeTupleReset(source: Reset) {
    let builder = new TupleBuilder();
    return builder.build();
}

function dictValueParserReset(): DictionaryValue<Reset> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeReset(src)).endCell());
        },
        parse: (src) => {
            return loadReset(src.loadRef().beginParse());
        }
    }
}

 type Channel_init_args = {
    $$type: 'Channel_init_args';
    owner: Address;
}

function initChannel_init_args(src: Channel_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.owner);
    };
}

async function Channel_init(owner: Address) {
    const __code = Cell.fromBase64('te6ccgECHgEABTMAART/APSkE/S88sgLAQIBYgIDAt7QAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxVEts88uCCyPhDAcx/AcoAVSBaINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WEss/9ADJ7VQQEQIBIAQFAgEgBgcCASAKCwJNu0WiDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjbPFUC2zxsMYEAgCEbhR3bPNs8bDGBAJADyBAQsiAnFBM/QKb6GUAdcAMJJbbeJ/IW6SW3CRuuIAAiICA3sgDA0AEbgr7tRNDSAAGAIPp4e2ebZ42GMQDgIPpW+2ebZ42GMQDwACIAACIQHG7UTQ1AH4Y9IAAY4o+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTP/QEVSBsE+D4KNcLCoMJuvLgifpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB0ds8EgTYAZIwf+BwIddJwh+VMCDXCx/eIIIQQy3xgbqOszDTHwGCEEMt8YG68uCB1AEB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBJsEuAgghAmf5QHuuMCIIIQVU+FibrjAiCCEESxgky6ExQVFgAacG2BLsH4QlJAxwXy9AK8RDTbPAGk+EJUQVXIVSCCEP/BgK1QBMsfEss/AQHMASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFsnIgljAAAAAAAAAAAAAAAABActnzMlw+wBQA21wbds8fxcbAqow0x8BghAmf5QHuvLggfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgxVSDbPIEBC1gEf3EhbpVbWfRZMJjIAc8AQTP0QeISbfhCAXBt2zx/GhsCPDDTHwGCEFVPhYm68uCBbTEw2zxwMm34QgFwbds8fxobBOqPYTDTHwGCEESxgky68uCB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHUWWwSRDTbPIIA2/EhgQELJnFBM/QKb6GUAdcAMJJbbeJ/IW6SW3CRuuLy9EA0f23bPH/gIIIQlGqYtrrjAoIQgZ2+mboaGxgZAEyCAIUvgQEL+EIjWXFBM/QKb6GUAdcAMJJbbeJ/IW6SW3CRuuLy9AFQMNMfAYIQlGqYtrry4IHTPwExyAGCEK/5D1dYyx/LP8n4QgFwbds8fxsC5o9u0x8BghCBnb6ZuvLggdM/+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBJsEkQ02zwyUSPIWYIQMnsrSlADyx/LPwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJ+EIBf23bPH/gMHAaGwAS+EJSMMcF8uCEAo5tbSJus5lbIG7y0IBvIgGRMuL4QW8kE18D+CdvEAGhggiYloC5jpSCCJiWgHD7AhAkcAMEgQCCUCPbPOAQJHADBIBCUCPbPBwcAcrIcQHKAVAHAcoAcAHKAlAFINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAP6AnABymgjbrORf5MkbrPilzMzAXABygDjDSFus5x/AcoAASBu8tCAAcyVMXABygDiyQH7AB0AmH8BygDIcAHKAHABygAkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDiJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4nABygACfwHKAALJWMw=');
    const __system = Cell.fromBase64('te6cckECIAEABT0AAQHAAQEFoY1dAgEU/wD0pBP0vPLICwMCAWIEEQLe0AHQ0wMBcbCjAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhUUFMDbwT4YQL4Yts8VRLbPPLggsj4QwHMfwHKAFUgWiDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFhLLP/QAye1UHAUE2AGSMH/gcCHXScIflTAg1wsf3iCCEEMt8YG6jrMw0x8BghBDLfGBuvLggdQBAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgSbBLgIIIQJn+UB7rjAiCCEFVPhYm64wIgghBEsYJMugYICQoCvEQ02zwBpPhCVEFVyFUgghD/wYCtUATLHxLLPwEBzAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJyIJYwAAAAAAAAAAAAAAAAQHLZ8zJcPsAUANtcG3bPH8HDgBMggCFL4EBC/hCI1lxQTP0Cm+hlAHXADCSW23ifyFukltwkbri8vQCqjDTHwGCECZ/lAe68uCB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiDFVINs8gQELWAR/cSFulVtZ9FkwmMgBzwBBM/RB4hJt+EIBcG3bPH8NDgI8MNMfAYIQVU+Fibry4IFtMTDbPHAybfhCAXBt2zx/DQ4E6o9hMNMfAYIQRLGCTLry4IH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdRZbBJENNs8ggDb8SGBAQsmcUEz9ApvoZQB1wAwkltt4n8hbpJbcJG64vL0QDR/bds8f+AgghCUapi2uuMCghCBnb6Zug0OCwwBUDDTHwGCEJRqmLa68uCB0z8BMcgBghCv+Q9XWMsfyz/J+EIBcG3bPH8OAuaPbtMfAYIQgZ2+mbry4IHTP/pAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgSbBJENNs8MlEjyFmCEDJ7K0pQA8sfyz8BINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyfhCAX9t2zx/4DBwDQ4AEvhCUjDHBfLghAKObW0ibrOZWyBu8tCAbyIBkTLi+EFvJBNfA/gnbxABoYIImJaAuY6UggiYloBw+wIQJHADBIEAglAj2zzgECRwAwSAQlAj2zwPDwHKyHEBygFQBwHKAHABygJQBSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFlAD+gJwAcpoI26zkX+TJG6z4pczMwFwAcoA4w0hbrOcfwHKAAEgbvLQgAHMlTFwAcoA4skB+wAQAJh/AcoAyHABygBwAcoAJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4iRus51/AcoABCBu8tCAUATMljQDcAHKAOJwAcoAAn8BygACyVjMAgEgEhcCASATFQJNu0WiDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjbPFUC2zxsMYHBQAPIEBCyICcUEz9ApvoZQB1wAwkltt4n8hbpJbcJG64gIRuFHds82zxsMYHBYAAiICASAYHwIDeyAZGwIPp4e2ebZ42GMcGgACIAIPpW+2ebZ42GMcHgHG7UTQ1AH4Y9IAAY4o+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTP/QEVSBsE+D4KNcLCoMJuvLgifpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB0ds8HQAacG2BLsH4QlJAxwXy9AACIQARuCvu1E0NIAAY3dFS9w==');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initChannel_init_args({ $$type: 'Channel_init_args', owner })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const Channel_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack underflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    137: { message: `Masterchain support is not enabled for this contract` },
    11969: { message: `Only owner can initialize this contract` },
    22178: { message: `Wrong call encoding` },
    34095: { message: `Only apps can send messages` },
    56305: { message: `Can only send messages to apps` },
}

const Channel_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounced","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SoraTransferMessage","header":null,"fields":[{"name":"token","type":{"kind":"simple","type":"address","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"recipient","type":{"kind":"simple","type":"Bytes32","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SoraTonTransferMessage","header":null,"fields":[{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"recipient","type":{"kind":"simple","type":"Bytes32","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SoraEncodedCall","header":null,"fields":[{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Bytes32","header":null,"fields":[{"name":"data","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"OutboundMessage","header":4290871469,"fields":[{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"message","type":{"kind":"simple","type":"SoraEncodedCall","optional":false}},{"name":"source","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SendOutboundMessage","header":1127084417,"fields":[{"name":"message","type":{"kind":"simple","type":"SoraEncodedCall","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SendInboundMessage","header":1152483916,"fields":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}},{"name":"message","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"RegisterApp","header":645895175,"fields":[{"name":"app","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Reset","header":1431274889,"fields":[]},
]

const Channel_getters: ABIGetter[] = [
    {"name":"isApp","arguments":[{"name":"app","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"apps","arguments":[],"returnType":{"kind":"dict","key":"address","value":"bool"}},
    {"name":"outboundNonce","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const Channel_getterMapping: { [key: string]: string } = {
    'isApp': 'getIsApp',
    'apps': 'getApps',
    'outboundNonce': 'getOutboundNonce',
    'owner': 'getOwner',
}

const Channel_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SendOutboundMessage"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RegisterApp"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Reset"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SendInboundMessage"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
]

export class Channel implements Contract {
    
    static async init(owner: Address) {
        return await Channel_init(owner);
    }
    
    static async fromInit(owner: Address) {
        const init = await Channel_init(owner);
        const address = contractAddress(0, init);
        return new Channel(address, init);
    }
    
    static fromAddress(address: Address) {
        return new Channel(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Channel_types,
        getters: Channel_getters,
        receivers: Channel_receivers,
        errors: Channel_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: SendOutboundMessage | RegisterApp | Reset | SendInboundMessage | Deploy | ChangeOwner) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SendOutboundMessage') {
            body = beginCell().store(storeSendOutboundMessage(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RegisterApp') {
            body = beginCell().store(storeRegisterApp(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Reset') {
            body = beginCell().store(storeReset(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SendInboundMessage') {
            body = beginCell().store(storeSendInboundMessage(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ChangeOwner') {
            body = beginCell().store(storeChangeOwner(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getIsApp(provider: ContractProvider, app: Address) {
        let builder = new TupleBuilder();
        builder.writeAddress(app);
        let source = (await provider.get('isApp', builder.build())).stack;
        let result = source.readBoolean();
        return result;
    }
    
    async getApps(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('apps', builder.build())).stack;
        let result = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.Bool(), source.readCellOpt());
        return result;
    }
    
    async getOutboundNonce(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('outboundNonce', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}