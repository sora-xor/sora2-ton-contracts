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

function loadGetterTupleStateInit(source: TupleReader) {
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

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    let sc_0 = slice;
    let _workchain = sc_0.loadIntBig(8);
    let _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

function loadTupleStdAddress(source: TupleReader) {
    let _workchain = source.readBigNumber();
    let _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

function loadGetterTupleStdAddress(source: TupleReader) {
    let _workchain = source.readBigNumber();
    let _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

function storeTupleStdAddress(source: StdAddress) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    let sc_0 = slice;
    let _workchain = sc_0.loadIntBig(32);
    let _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

function loadTupleVarAddress(source: TupleReader) {
    let _workchain = source.readBigNumber();
    let _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

function loadGetterTupleVarAddress(source: TupleReader) {
    let _workchain = source.readBigNumber();
    let _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

function storeTupleVarAddress(source: VarAddress) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
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

function loadGetterTupleContext(source: TupleReader) {
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

function loadGetterTupleSendParameters(source: TupleReader) {
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

function loadGetterTupleDeploy(source: TupleReader) {
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

function loadGetterTupleDeployOk(source: TupleReader) {
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

function loadGetterTupleFactoryDeploy(source: TupleReader) {
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

function loadGetterTupleChangeOwner(source: TupleReader) {
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

function loadGetterTupleChangeOwnerOk(source: TupleReader) {
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
    const _recipient = loadTupleBytes32(source);
    let _amount = source.readBigNumber();
    return { $$type: 'SoraTransferMessage' as const, token: _token, sender: _sender, recipient: _recipient, amount: _amount };
}

function loadGetterTupleSoraTransferMessage(source: TupleReader) {
    let _token = source.readAddress();
    let _sender = source.readAddress();
    const _recipient = loadGetterTupleBytes32(source);
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
    const _recipient = loadTupleBytes32(source);
    let _amount = source.readBigNumber();
    return { $$type: 'SoraTonTransferMessage' as const, sender: _sender, recipient: _recipient, amount: _amount };
}

function loadGetterTupleSoraTonTransferMessage(source: TupleReader) {
    let _sender = source.readAddress();
    const _recipient = loadGetterTupleBytes32(source);
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

function loadGetterTupleSoraEncodedCall(source: TupleReader) {
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
    const _message = loadTupleSoraEncodedCall(source);
    let _sender = source.readAddress();
    return { $$type: 'SendOutboundMessage' as const, message: _message, sender: _sender };
}

function loadGetterTupleSendOutboundMessage(source: TupleReader) {
    const _message = loadGetterTupleSoraEncodedCall(source);
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

function loadGetterTupleSendInboundMessage(source: TupleReader) {
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

function loadGetterTupleBytes32(source: TupleReader) {
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
    const _soraAddress = loadTupleBytes32(source);
    let _amount = source.readBigNumber();
    return { $$type: 'SendTon' as const, soraAddress: _soraAddress, amount: _amount };
}

function loadGetterTupleSendTon(source: TupleReader) {
    const _soraAddress = loadGetterTupleBytes32(source);
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

function loadGetterTupleMigrate(source: TupleReader) {
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
    amount: bigint;
}

export function storeMigrateInternal(src: MigrateInternal) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3977371234, 32);
        b_0.storeInt(src.amount, 257);
    };
}

export function loadMigrateInternal(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3977371234) { throw Error('Invalid prefix'); }
    let _amount = sc_0.loadIntBig(257);
    return { $$type: 'MigrateInternal' as const, amount: _amount };
}

function loadTupleMigrateInternal(source: TupleReader) {
    let _amount = source.readBigNumber();
    return { $$type: 'MigrateInternal' as const, amount: _amount };
}

function loadGetterTupleMigrateInternal(source: TupleReader) {
    let _amount = source.readBigNumber();
    return { $$type: 'MigrateInternal' as const, amount: _amount };
}

function storeTupleMigrateInternal(source: MigrateInternal) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.amount);
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

export type TonApp$Data = {
    $$type: 'TonApp$Data';
    owner: Address;
    lockedAmount: bigint;
    stopped: boolean;
}

export function storeTonApp$Data(src: TonApp$Data) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.lockedAmount, 128);
        b_0.storeBit(src.stopped);
    };
}

export function loadTonApp$Data(slice: Slice) {
    let sc_0 = slice;
    let _owner = sc_0.loadAddress();
    let _lockedAmount = sc_0.loadUintBig(128);
    let _stopped = sc_0.loadBit();
    return { $$type: 'TonApp$Data' as const, owner: _owner, lockedAmount: _lockedAmount, stopped: _stopped };
}

function loadTupleTonApp$Data(source: TupleReader) {
    let _owner = source.readAddress();
    let _lockedAmount = source.readBigNumber();
    let _stopped = source.readBoolean();
    return { $$type: 'TonApp$Data' as const, owner: _owner, lockedAmount: _lockedAmount, stopped: _stopped };
}

function loadGetterTupleTonApp$Data(source: TupleReader) {
    let _owner = source.readAddress();
    let _lockedAmount = source.readBigNumber();
    let _stopped = source.readBoolean();
    return { $$type: 'TonApp$Data' as const, owner: _owner, lockedAmount: _lockedAmount, stopped: _stopped };
}

function storeTupleTonApp$Data(source: TonApp$Data) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.lockedAmount);
    builder.writeBoolean(source.stopped);
    return builder.build();
}

function dictValueParserTonApp$Data(): DictionaryValue<TonApp$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTonApp$Data(src)).endCell());
        },
        parse: (src) => {
            return loadTonApp$Data(src.loadRef().beginParse());
        }
    }
}

 type TonApp_init_args = {
    $$type: 'TonApp_init_args';
    channel: Address;
    seqno: bigint;
}

function initTonApp_init_args(src: TonApp_init_args) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeAddress(src.channel);
        b_0.storeInt(src.seqno, 257);
    };
}

async function TonApp_init(channel: Address, seqno: bigint) {
    const __code = Cell.fromBase64('te6ccgECIgEABNsAART/APSkE/S88sgLAQIBYgIDAt7QAdDTAwFxsKMB+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiFRQUwNvBPhhAvhi2zxVEts88uCCyPhDAcx/AcoAVSBaINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WEst/ygDJ7VQfBAIBIBUWBPABjrCAINchcCHXScIflTAg1wsf3oIQ7RHeYrqOk9MfAYIQ7RHeYrry4IFtMTDbPH/gMH/gcCHXScIflTAg1wsf3iCCEPrusvu6jpow0x8BghD67rL7uvLggdP/AQGBAQHXAFlsEuAgghDtEd5iuuMCIIIQBIW3HboFBgcIAAQwcAPqRDTbPIIA0Ob4QW8kE18Dggr68IAnoLzy9PhCVBQFElA2oIIImJaAIaBw+wJwUCOBAIIH2zz4QshZghBDLfGBUAPLHwEBzAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJI0MTUGZ/VTBtbds8MFl/DgkTAVYw0x8BghDtEd5iuvLggYEBAdcAATFVINs8gRQt+EFvJBNfAyW+8vQDoFh/DgPkjrEw0x8BghAEhbcduvLggfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4Igx2zx/4CCCEJRqmLa6jqgw0x8BghCUapi2uvLggdM/ATHIAYIQr/kPV1jLH8s/yfhCAXBt2zx/4IIQgZ2+mbrjAjBwDBINAkrIgQYAAcsPcAHLD3ABy/9QA9s8Ads8y3+BVqIhzzGBA7C68vTJCgsARnBYywQBINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WAAYBy/8ESFUg2zzbPNs8cIMGI8gBghDtEd5iWMsfgQEBzwDJEDZ/VTBtbREODxAC3NMfAYIQgZ2+mbry4IHTP/pAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgSbBJENNs8MlEjyFmCEDJ7K0pQA8sfyz8BINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WyfhCAX9t2zx/ERIAEIIAnbAhs/L0AAQwfwEI2zwwWBMAEvhCUjDHBfLghAE8bW0ibrOZWyBu8tCAbyIBkTLiECRwAwSAQlAj2zwwEwHKyHEBygFQBwHKAHABygJQBSDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFlAD+gJwAcpoI26zkX+TJG6z4pczMwFwAcoA4w0hbrOcfwHKAAEgbvLQgAHMlTFwAcoA4skB+wgUAJh/AcoAyHABygBwAcoAJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4iRus51/AcoABCBu8tCAUATMljQDcAHKAOJwAcoAAn8BygACyVjMAgEgFxgCAnQdHgIBIBkaAhG4Ud2zzbPGwxgfHAIRtaG7Z5tnjYYwHxsCEbQve2ebZ42GMB8bAAIgAAIiABGtX3aiaGkAAMACEa88bZ5tnjYYwB8gAdbtRNDUAfhj0gABjij6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIAdN/0gBVIGwT4Pgo1wsKgwm68uCJ+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAGBAQHXAFkC0QHbPCEAAiEABjBwcA==');
    const __system = Cell.fromBase64('te6cckECJAEABOUAAQHAAQEFoVuXAgEU/wD0pBP0vPLICwMCAWIEFgLe0AHQ0wMBcbCjAfpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IhUUFMDbwT4YQL4Yts8VRLbPPLggsj4QwHMfwHKAFUgWiDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFhLLf8oAye1UIQUE8AGOsIAg1yFwIddJwh+VMCDXCx/eghDtEd5iuo6T0x8BghDtEd5iuvLggW0xMNs8f+Awf+BwIddJwh+VMCDXCx/eIIIQ+u6y+7qOmjDTHwGCEPrusvu68uCB0/8BAYEBAdcAWWwS4CCCEO0R3mK64wIgghAEhbcdugYHCwwABDBwA+pENNs8ggDQ5vhBbyQTXwOCCvrwgCegvPL0+EJUFAUSUDagggiYloAhoHD7AnBQI4EAggfbPPhCyFmCEEMt8YFQA8sfAQHMASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IjPFskjQxNQZn9VMG1t2zwwWX8OCBQCSsiBBgAByw9wAcsPcAHL/1AD2zwB2zzLf4FWoiHPMYEDsLry9MkJCgBGcFjLBAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxYABgHL/wFWMNMfAYIQ7RHeYrry4IGBAQHXAAExVSDbPIEULfhBbyQTXwMlvvL0A6BYfw4D5I6xMNMfAYIQBIW3Hbry4IH6QAEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIMds8f+AgghCUapi2uo6oMNMfAYIQlGqYtrry4IHTPwExyAGCEK/5D1dYyx/LP8n4QgFwbds8f+CCEIGdvpm64wIwcA0TEQRIVSDbPNs82zxwgwYjyAGCEO0R3mJYyx+BAQHPAMkQNn9VMG1tEg4PEAAQggCdsCGz8vQABDB/AQjbPDBYFALc0x8BghCBnb6ZuvLggdM/+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiBJsEkQ02zwyUSPIWYIQMnsrSlADyx/LPwEg10mBAQu68uCIINcLCiCBBP+68tCJgwm68uCIzxbJ+EIBf23bPH8SEwAS+EJSMMcF8uCEATxtbSJus5lbIG7y0IBvIgGRMuIQJHADBIBCUCPbPDAUAcrIcQHKAVAHAcoAcAHKAlAFINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiM8WUAP6AnABymgjbrORf5MkbrPilzMzAXABygDjDSFus5x/AcoAASBu8tCAAcyVMXABygDiyQH7CBUAmH8BygDIcAHKAHABygAkbrOdfwHKAAQgbvLQgFAEzJY0A3ABygDiJG6znX8BygAEIG7y0IBQBMyWNANwAcoA4nABygACfwHKAALJWMwCASAXHgIBIBgcAgEgGRoCEbWhu2ebZ42GMCEbAhG0L3tnm2eNhjAhGwACIAIRuFHds82zxsMYIR0AAiICAnQfIAARrV92omhpAADAAhGvPG2ebZ42GMAhIwHW7UTQ1AH4Y9IAAY4o+kABINdJgQELuvLgiCDXCwoggQT/uvLQiYMJuvLgiAHTf9IAVSBsE+D4KNcLCoMJuvLgifpAASDXSYEBC7ry4Igg1wsKIIEE/7ry0ImDCbry4IgBgQEB1wBZAtEB2zwiAAYwcHAAAiEk5ZVV');
    let builder = beginCell();
    builder.storeRef(__system);
    builder.storeUint(0, 1);
    initTonApp_init_args({ $$type: 'TonApp_init_args', channel, seqno })(builder);
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
    11: { message: `'Unknown' error` },
    12: { message: `Fatal error` },
    13: { message: `Out of gas error` },
    14: { message: `Virtualization error` },
    32: { message: `Action list is invalid` },
    33: { message: `Action list is too long` },
    34: { message: `Action is invalid or not supported` },
    35: { message: `Invalid source address in outbound message` },
    36: { message: `Invalid destination address in outbound message` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    39: { message: `Outbound message does not fit into a cell after rewriting` },
    40: { message: `Cannot process a message` },
    41: { message: `Library reference is null` },
    42: { message: `Library change action error` },
    43: { message: `Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree` },
    50: { message: `Account state size exceeded limits` },
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
    5165: { message: `Not enough value` },
    22178: { message: `Wrong call encoding` },
    40368: { message: `Contract stopped` },
    53296: { message: `Contract not stopped` },
    53478: { message: `Amount should be greater than value` },
}

const TonApp_types: ABIType[] = [
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
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
    {"name":"SendOutboundMessage","header":1127084417,"fields":[{"name":"message","type":{"kind":"simple","type":"SoraEncodedCall","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SendInboundMessage","header":1152483916,"fields":[{"name":"target","type":{"kind":"simple","type":"address","optional":false}},{"name":"message","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Bytes32","header":null,"fields":[{"name":"data","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"SendTon","header":4209947387,"fields":[{"name":"soraAddress","type":{"kind":"simple","type":"Bytes32","optional":false}},{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"Migrate","header":75872029,"fields":[{"name":"receiver","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MigrateInternal","header":3977371234,"fields":[{"name":"amount","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"TonApp$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"lockedAmount","type":{"kind":"simple","type":"uint","optional":false,"format":128}},{"name":"stopped","type":{"kind":"simple","type":"bool","optional":false}}]},
]

const TonApp_getters: ABIGetter[] = [
    {"name":"lockedAmount","arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"isStopped","arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"owner","arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"stopped","arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
]

export const TonApp_getterMapping: { [key: string]: string } = {
    'lockedAmount': 'getLockedAmount',
    'isStopped': 'getIsStopped',
    'owner': 'getOwner',
    'stopped': 'getStopped',
}

const TonApp_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SendTon"}},
    {"receiver":"internal","message":{"kind":"typed","type":"MigrateInternal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Migrate"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ChangeOwner"}},
]

export class TonApp implements Contract {
    
    static async init(channel: Address, seqno: bigint) {
        return await TonApp_init(channel, seqno);
    }
    
    static async fromInit(channel: Address, seqno: bigint) {
        const init = await TonApp_init(channel, seqno);
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
    
    async getStopped(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('stopped', builder.build())).stack;
        let result = source.readBoolean();
        return result;
    }
    
}