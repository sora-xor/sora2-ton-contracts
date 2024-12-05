import * as TonApp from "@/contracts/TonApp";
import * as Channel from "@/contracts/Channel";
import { beginCell, Cell, Message, Slice, Transaction } from "@ton/core";
import { CHAIN } from "@tonconnect/ui";
import { TonClient } from "@ton/ton";

type Loader = (arg: Slice) => any;
type ModuleLoaderKeys<T> = {
    [Key in keyof T]: T[Key] extends Loader
    ? Key
    : never;
}[keyof T] & `load${string}`;

type TonAppTypes = ReturnType<typeof TonApp[ModuleLoaderKeys<typeof TonApp>]>;
type ChannelTypes = ReturnType<typeof Channel[ModuleLoaderKeys<typeof Channel>]>;

type Empty = {
    $$type: "Empty"
};

function loadEmpty(src: Slice): Empty {
    src.endParse();
    return {
        $$type: "Empty"
    };
}


const loadFunctions: Loader[] = [...Object.entries(TonApp), ...Object.entries(Channel)]
    .filter(([key, value]) => key.startsWith('load') && typeof value === 'function')
    .filter(([_, value]) => {
        try {
            const loader = value as Loader;
            loader(beginCell().storeUint(0, 32).asSlice());
            return false;
        } catch (e) {
            if (e instanceof Error && e.message == 'Invalid prefix') {
                return true;
            }
            return false;
        }
    })
    .map(([_, value]) => value as Loader).concat([loadEmpty]);

export type MessageBody = TonAppTypes | ChannelTypes | undefined;

export type TransactionWrapper = {
    hash: string;
    now: number;
    totalFees: bigint;
    inMessage: MessageWrapper | undefined;
    outMessages: MessageWrapper[];
};

export type MessageWrapper = InternalMessageWrapper | ExternalInMessageWrapper | ExternalOutMessageWrapper;

export type InternalMessageWrapper = {
    src: string;
    dest: string;
    value: bigint;
    details: MessageBody;
    type: 'internal';
};

export type ExternalInMessageWrapper = {
    src: string | undefined;
    dest: string;
    details: MessageBody;
    type: 'external-in'
};

export type ExternalOutMessageWrapper = {
    src: string;
    dest: string | undefined;
    details: MessageBody;
    type: 'external-out'
};

function parseBody(body: Cell | undefined) {
    return loadFunctions.map((method) => {
        if (!body) return;
        try {
            return method(body.asSlice());
        } catch {
            return;
        }
    }).filter((tx) => tx !== undefined).at(0);
}

function parseMessage(msg: Message | undefined | null, chain: CHAIN | undefined): MessageWrapper | undefined {
    if (!msg) return;
    const details = parseBody(msg.body);
    if (msg.info.type == 'internal') {
        return {
            type: 'internal',
            details,
            src: msg.info.src.toString({ testOnly: chain === CHAIN.TESTNET }),
            dest: msg.info.dest.toString({ testOnly: chain === CHAIN.TESTNET }),
            value: msg.info.value.coins,
        };
    } else if (msg.info.type == 'external-in') {
        return {
            type: 'external-in',
            src: msg.info.src ? msg.info.src.toString() : undefined,
            dest: msg.info.dest.toString({ testOnly: chain === CHAIN.TESTNET }),
            details
        };
    } else if (msg.info.type == 'external-out') {
        return {
            type: 'external-out',
            dest: msg.info.dest ? msg.info.dest.toString() : undefined,
            src: msg.info.src.toString({ testOnly: chain === CHAIN.TESTNET }),
            details
        };
    }
}

export function parseTransaction(tx: Transaction, chain: CHAIN | undefined): TransactionWrapper {
    return {
        now: tx.now,
        hash: tx.hash().toString('hex'),
        totalFees: tx.totalFees.coins,
        inMessage: parseMessage(tx.inMessage, chain),
        outMessages: tx.outMessages.values().map((msg) => parseMessage(msg, chain)).filter((msg) => msg !== undefined)
    } as TransactionWrapper;
}
