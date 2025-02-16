import { Cell, beginCell, Address, Slice, Dictionary } from "@ton/core";
import { sha256, sha256_sync } from '@ton/crypto';

const ONCHAIN_CONTENT_PREFIX = 0x00;
const SNAKE_PREFIX = 0x00;
const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);

export type JettonMetaDataKeys = "name" | "description" | "image" | "symbol";

const jettonOnChainMetadataSpec: {
    [key in JettonMetaDataKeys]: "utf8" | "ascii" | undefined;
} = {
    name: "utf8",
    description: "utf8",
    image: "ascii",
    symbol: "utf8",
};

export function buildTokenMetadataCell(data: { [s: string]: string | undefined }): Cell {
    const dict = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());

    Object.entries(data).forEach(([k, v]: [string, string | undefined]) => {
        if (!jettonOnChainMetadataSpec[k as JettonMetaDataKeys])
            throw new Error(`Unsupported onchain key: ${k}`);
        if (v === undefined || v === "") return;

        let bufferToStore = Buffer.from(v, jettonOnChainMetadataSpec[k as JettonMetaDataKeys]);

        const cell = bufferToCell(bufferToStore);
        dict.set(BigInt('0x' + sha256_sync(k).toString('hex')), cell);
    });

    return beginCell().storeInt(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict).endCell();
}

function bufferToCell(buff: Buffer, first = true): Cell {
    const cell = beginCell();
    if (first) {
        cell.storeUint(SNAKE_PREFIX, 8);
    }
    cell.storeBuffer(buff.subarray(0, CELL_MAX_SIZE_BYTES));
    if (buff.length > CELL_MAX_SIZE_BYTES) {
        cell.storeRef(bufferToCell(buff.subarray(CELL_MAX_SIZE_BYTES), false));
    }
    return cell.endCell();
}

function bufferFromCell(cell: Cell, first = true): Buffer {
    const parser = cell.beginParse();
    if (first) {
        if (parser?.loadUint(8) !== SNAKE_PREFIX)
            throw new Error("Only snake format is supported");
    }
    const buff = parser.loadBuffer(Math.floor(parser.remainingBits / 8));
    if (parser.remainingRefs === 0) {
        parser.endParse();
        return buff;
    } else if (parser.remainingRefs === 1) {
        const innerCell = parser.loadRef();
        parser.endParse();
        return Buffer.concat([buff, bufferFromCell(innerCell, false)]);
    } else {
        throw new Error("Unexpected amount of refs");
    }
}

export function parseTokenMetadataCell(contentCell: Cell): {
    [s in JettonMetaDataKeys]?: string;
} {
    const contentSlice = contentCell.beginParse();
    if (contentSlice.loadUint(8) !== ONCHAIN_CONTENT_PREFIX)
        throw new Error("Expected onchain content marker");

    const dict = contentSlice.loadDict(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());
    contentSlice.endParse();

    const res: { [s in JettonMetaDataKeys]?: string } = {};

    dict.keys().forEach((v) => {
        console.log('Key', v.toString(16));
        const val = dict.get(v);
        console.log(val);
    })
    Object.keys(jettonOnChainMetadataSpec).forEach((k) => {
        console.log('Key', sha256_sync(k).toString('hex'), k);
        const cell = dict.get(BigInt('0x' + sha256_sync(k).toString('hex')));
        console.log(cell);
        const buffer = cell && bufferFromCell(cell);
        const val = buffer?.toString(jettonOnChainMetadataSpec[k as JettonMetaDataKeys]);
        if (val) res[k as JettonMetaDataKeys] = val;
    });

    return res;
}
