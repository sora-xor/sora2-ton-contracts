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

export type SendTon = {
    $$type: 'SendTon';
    soraAddress: Bytes32;
    amount: bigint;
}

export function storeSendTon(src: SendTon) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(4209947387, 32);
        b_0.store(storeBytes32(src.soraAddress));
        b_0.storeInt(src.amount, 257);
    };
}

export function loadSendTon(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 4209947387) { throw Error('Invalid prefix'); }
    let _soraAddress = loadBytes32(sc_0);
    let _amount = sc_0.loadIntBig(257);
    return { $$type: 'SendTon' as const, soraAddress: _soraAddress, amount: _amount };
}

function loadTupleSendTon(source: TupleReader) {
    const _soraAddress = loadTupleBytes32(source.readTuple());
    let _amount = source.readBigNumber();
    return { $$type: 'SendTon' as const, soraAddress: _soraAddress, amount: _amount };
}

function storeTupleSendTon(source: SendTon) {
    let builder = new TupleBuilder();
    builder.writeTuple(storeTupleBytes32(source.soraAddress));
    builder.writeNumber(source.amount);
    return builder.build();
}

function dictValueParserSendTon(): DictionaryValue<SendTon> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendTon(src)).endCell());
        },
        parse: (src) => {
            return loadSendTon(src.loadRef().beginParse());
        }
    }
}

export type Migrate = {
    $$type: 'Migrate';
    receiver: Address;
}

export function storeMigrate(src: Migrate) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(75872029, 32);
        b_0.storeAddress(src.receiver);
    };
}

export function loadMigrate(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 75872029) { throw Error('Invalid prefix'); }
    let _receiver = sc_0.loadAddress();
    return { $$type: 'Migrate' as const, receiver: _receiver };
}

function loadTupleMigrate(source: TupleReader) {
    let _receiver = source.readAddress();
    return { $$type: 'Migrate' as const, receiver: _receiver };
}

function storeTupleMigrate(source: Migrate) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.receiver);
    return builder.build();
}

function dictValueParserMigrate(): DictionaryValue<Migrate> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMigrate(src)).endCell());
        },
        parse: (src) => {
            return loadMigrate(src.loadRef().beginParse());
        }
    }
}

export type MigrateInternal = {
    $$type: 'MigrateInternal';
}

export function storeMigrateInternal(src: MigrateInternal) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(803640040, 32);
    };
}

export function loadMigrateInternal(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 803640040) { throw Error('Invalid prefix'); }
    return { $$type: 'MigrateInternal' as const };
}

function loadTupleMigrateInternal(source: TupleReader) {
    return { $$type: 'MigrateInternal' as const };
}

function storeTupleMigrateInternal(source: MigrateInternal) {
    let builder = new TupleBuilder();
    return builder.build();
}

function dictValueParserMigrateInternal(): DictionaryValue<MigrateInternal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMigrateInternal(src)).endCell());
        },
        parse: (src) => {
            return loadMigrateInternal(src.loadRef().beginParse());
        }
    }
}

 type TonApp_init_args = {
    $$type: 'TonApp_init_args';
    channel: Address;
}

function initTonApp_init_args(src: TonApp_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.channel);
    };
}

async function TonApp_init(channel: Address) {
    const __code = Cell.fromBase64('te6ccgECHAEABGEAART/APSkE/S88sgLAQIBYgIDAt7QAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxVEts88uCCyPhDAcx/AcoAVSBaINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WEst/ygDJ7VQZBAIBIBESBOQBkjB/4HAh10nCH5UwINcLH94gghD67rL7uo6aMNMfAYIQ+u6y+7ry4IHT/wEBgQEB1wBZbBLgIIIQL+aS6LqOnjDTHwGCEC/mkui68uCBbTEw2zz4QW8kE18DEqABf+AgghAEhbcduuMCIIIQlGqYtroFCwYHA9BENNs8ggDQ5vhBbyQTXwMmvPL0+EJUFAUSJnT7AlA2oHBQI4EAkAfbPPhCyFmCEEMt8YFQA8sfAQHMASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFskjQxNQZn9VMG1t2zxZfwsIDwOoMNMfAYIQBIW3Hbry4IH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIMVUg2zzbPDB/cIEAom8AyAEwghAv5pLoAcsfyRA2f1UwbW3bPFh/DQsPAmyOqDDTHwGCEJRqmLa68uCB0z8BMcgBghCv+Q9XWMsfyz/J+EIBcG3bPH/gghCBnb6ZuuMCMHAODAJKyIEGAAHLD3AByw9wAcv/UAPbPAHbPMt/gVaiIc8xgQOwuvL0yQkKAEZwWMsEASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFgAGAcv/ABCBfx8hwADy9ALc0x8BghCBnb6ZuvLggdM/+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBJsEkQ02zwyUSPIWYIQMnsrSlADyx/LPwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJ+EIBf23bPH8NDgAS+EJSMMcF8uCEATptbSJus5lbIG7y0IBvIgGRMuIQJHADBIBCUCPbPA8ByshxAcoBUAcBygBwAcoCUAUg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxZQA/oCcAHKaCNus5F/kyRus+KXMzMBcAHKAOMNIW6znH8BygABIG7y0IABzJUxcAHKAOLJAfsAEACYfwHKAMhwAcoAcAHKACRus51/AcoABCBu8tCAUATMljQDcAHKAOIkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDicAHKAAJ/AcoAAslYzAIBIBMUAgJ0FxgCEbjQ3bPNs8bDGBkVAhG4Ud2zzbPGwxgZFgACIAACIgARrV92omhpAADAAhGvPG2ebZ42GMAZGgHG7UTQ1AH4Y9IAAY4o+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTf9IAVSBsE+D4KNcLCoMJuvLgifpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB0ds8GwACIQAEcHA=');
    const __system = Cell.fromBase64('te6cckECHgEABGsAAQHAAQEFoVuXAgEU/wD0pBP0vPLICwMCAWIEEgLe0AHQ0wMBcbCjAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhUUFMDbwT4YQL4Yts8VRLbPPLggsj4QwHMfwHKAFUgWiDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFhLLf8oAye1UGwUE5AGSMH/gcCHXScIflTAg1wsf3iCCEPrusvu6jpow0x8BghD67rL7uvLggdP/AQGBAQHXAFlsEuAgghAv5pLouo6eMNMfAYIQL+aS6Lry4IFtMTDbPPhBbyQTXwMSoAF/4CCCEASFtx264wIgghCUapi2ugYLCgwD0EQ02zyCANDm+EFvJBNfAya88vT4QlQUBRImdPsCUDagcFAjgQCQB9s8+ELIWYIQQy3xgVADyx8BAcwBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WySNDE1Bmf1UwbW3bPFl/CwcQAkrIgQYAAcsPcAHLD3ABy/9QA9s8Ads8y3+BVqIhzzGBA7C68vTJCAkARnBYywQBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WAAYBy/8DqDDTHwGCEASFtx268uCB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiDFVINs82zwwf3CBAKJvAMgBMIIQL+aS6AHLH8kQNn9VMG1t2zxYfw4LEAAQgX8fIcAA8vQCbI6oMNMfAYIQlGqYtrry4IHTPwExyAGCEK/5D1dYyx/LP8n4QgFwbds8f+CCEIGdvpm64wIwcA8NAtzTHwGCEIGdvpm68uCB0z/6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIEmwSRDTbPDJRI8hZghAyeytKUAPLH8s/ASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFsn4QgF/bds8fw4PABL4QlIwxwXy4IQBOm1tIm6zmVsgbvLQgG8iAZEy4hAkcAMEgEJQI9s8EAHKyHEBygFQBwHKAHABygJQBSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFlAD+gJwAcpoI26zkX+TJG6z4pczMwFwAcoA4w0hbrOcfwHKAAEgbvLQgAHMlTFwAcoA4skB+wARAJh/AcoAyHABygBwAcoAJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4iRus51/AcoABCBu8tCAUATMljQDcAHKAOJwAcoAAn8BygACyVjMAgEgExgCASAUFgIRuNDds82zxsMYGxUAAiACEbhR3bPNs8bDGBsXAAIiAgJ0GRoAEa1fdqJoaQAAwAIRrzxtnm2eNhjAGx0Bxu1E0NQB+GPSAAGOKPpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgB03/SAFUgbBPg+CjXCwqDCbry4In6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdHbPBwABHBwAAIh+M8iDw==');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initTonApp_init_args({ $$type: 'TonApp_init_args', channel })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

const TonApp_errors: { [key: number]: { message: string } } = {
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
    32543: { message: `App is stopped` },
    34095: { message: `Only apps can send messages` },
    53478: { message: `Amount should be greater than value` },
    56305: { message: `Can only send messages to apps` },
}

const TonApp_types: ABIType[] = [
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
    {"name":"OutboundMessage","header":4290871469,"fields":[{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"message","type":{"kind":"simple","type":"SoraEncodedCall","optional":false}},{"name":"source","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SendOutboundMessage","header":1127084417,"fields":[{"name":"message","type":{"kind":"simple","type":"SoraEncodedCall","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SendInboundMessage","header":1152483916,"fields":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}},{"name":"message","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"RegisterApp","header":645895175,"fields":[{"name":"app","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"Reset","header":1431274889,"fields":[]},
    {"name":"Bytes32","header":null,"fields":[{"name":"data","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"SendTon","header":4209947387,"fields":[{"name":"soraAddress","type":{"kind":"simple","type":"Bytes32","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Migrate","header":75872029,"fields":[{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MigrateInternal","header":803640040,"fields":[]},
]

const TonApp_getters: ABIGetter[] = [
    {"name":"lockedAmount","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isStopped","arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const TonApp_getterMapping: { [key: string]: string } = {
    'lockedAmount': 'getLockedAmount',
    'isStopped': 'getIsStopped',
    'owner': 'getOwner',
}

const TonApp_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SendTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"MigrateInternal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Migrate"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
]

export class TonApp implements Contract {
    
    static async init(channel: Address) {
        return await TonApp_init(channel);
    }
    
    static async fromInit(channel: Address) {
        const init = await TonApp_init(channel);
        const address = contractAddress(0, init);
        return new TonApp(address, init);
    }
    
    static fromAddress(address: Address) {
        return new TonApp(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  TonApp_types,
        getters: TonApp_getters,
        receivers: TonApp_receivers,
        errors: TonApp_errors,
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: SendTon | MigrateInternal | Migrate | Deploy | ChangeOwner) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SendTon') {
            body = beginCell().store(storeSendTon(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MigrateInternal') {
            body = beginCell().store(storeMigrateInternal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Migrate') {
            body = beginCell().store(storeMigrate(message)).endCell();
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
    
    async getLockedAmount(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('lockedAmount', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getIsStopped(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('isStopped', builder.build())).stack;
        let result = source.readBoolean();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('owner', builder.build())).stack;
        let result = source.readAddress();
        return result;
    }
    
}