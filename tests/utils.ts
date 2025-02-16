import {
    Address,
    Contract,
    Dictionary,
    fromNano,
    Slice,
    Sender,
    toNano
} from '@ton/core';
import {
    BlockchainSnapshot,
    BlockchainTransaction,
    SandboxContract,
    SendMessageResult,
    TreasuryContract,
} from '@ton/sandbox';
import { Digraph, Subgraph, Node, Edge } from '@ts-graphviz/core';
import { Color, Style, toDot } from 'ts-graphviz';
import { toFile } from '@ts-graphviz/adapter';
import { Deploy } from '../wrappers/Channel';
import fs from "fs";

export type SendParams = {
    value: bigint;
    bounce?: boolean | null | undefined
};

interface DeployableContract {
    send: (sender: Sender, opts: SendParams, message: Deploy) => Promise<SendMessageResult>;
    address: Address;
}

export async function deployContract(contract: DeployableContract, sender: SandboxContract<TreasuryContract>) {
    const deployResult = await contract.send(
        sender.getSender(),
        { value: toNano(1), },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    expect(deployResult.transactions).toHaveTransaction({
        from: sender.address,
        to: contract.address,
        deploy: true,
        success: true,
    });
}


type Maybe<T> = T | undefined | null;

/** --------------------------------------------------------------------------
 * Constants
 * -------------------------------------------------------------------------- */

const LABEL_UNKNOWN = 'Unknown';

// Graph rendering settings
const GRAPH_SUB = 'A';
const FILE_FORMAT = 'png';
const OUTPUT_DIR = './graphs'; // default output directory
const NODE_CONFIG = {
    fontcolor: "#e6e6e6" as Color,
    style: 'filled' as Style,
    color: "#e6e6e6" as Color,
    fillcolor: "#333333" as Color
};
const EDGE_CONFIG = {
    color: "#e6e6e6" as Color,
    fontcolor: "#e6e6e6" as Color
};

/** --------------------------------------------------------------------------
 * Types & Interfaces
 * -------------------------------------------------------------------------- */

// Minimal text styling for Dot rendering
type TextOptions = { bold?: boolean; color?: string } | undefined;
interface RenderItem {
    render(): string;
}

// Parser function signature
interface TypeParser {
    (
        table: DotTable,
        slice: Slice,
        name?: string,
        format?: Maybe<string | number | boolean>,
        optional?: Maybe<boolean>,
    ): void;
}

/** --------------------------------------------------------------------------
 * DOT Rendering Helpers
 * -------------------------------------------------------------------------- */

/** A horizontal divider (<HR/>) inside a DOT table cell. */
class HDivider implements RenderItem {
    public render(): string {
        return '<HR/>';
    }
}

/** A table row field (<TD>..</TD>) in DOT HTML syntax. */
class DotField {
    public static value(value: string, opts: TextOptions = undefined): DotField {
        return new DotField(value, opts);
    }

    private constructor(private readonly value: string, private readonly opts: TextOptions) { }

    public render(): string {
        let text = this.value;
        if (this.opts?.bold) text = `<B>${text}</B>`;
        if (this.opts?.color) text = `<FONT COLOR="${this.opts.color}">${text}</FONT>`;
        return `<TD>${text}</TD>`;
    }
}

/** A single row (<TR>..</TR>) in a DOT HTML-like label. */
class DotRow implements RenderItem {
    private readonly fields: DotField[] = [];

    public static empty(): DotRow {
        return new DotRow();
    }

    public add(...fields: DotField[]): this {
        this.fields.push(...fields);
        return this;
    }

    public static pair(key: string, value: string, opts: TextOptions = undefined): DotRow {
        return DotRow.empty().add(DotField.value(key, opts), DotField.value(value, opts));
    }

    public render(): string {
        return `<TR>${this.fields.map((f) => f.render()).join('')}</TR>`;
    }
}

/** A table (<TABLE>..</TABLE>) composed of multiple rows and dividers. */
class DotTable implements RenderItem {
    private readonly rows: RenderItem[] = [];

    public static empty(): DotTable {
        return new DotTable();
    }

    public add(...items: RenderItem[]): void {
        this.rows.push(...items);
    }

    public addPair(key: string, value: string, opts?: TextOptions): void {
        this.rows.push(DotRow.pair(key, value, opts));
    }

    public addMaybePair(key: string, value?: string, opts?: TextOptions): void {
        if (value) this.addPair(key, value, opts);
    }

    public addBool(key: string, value: boolean, opts?: TextOptions): void {
        if (value) this.addPair(key, value.toString(), opts);
    }

    public addHDivider(): void {
        this.rows.push(new HDivider());
    }

    public render(): string {
        const content = this.rows.map((row) => row.render()).join('');
        return `<TABLE>${content}</TABLE>`;
    }
}

/** --------------------------------------------------------------------------
 * Parsing Logic
 * -------------------------------------------------------------------------- */

/**
 * Utility to parse coin-like or big integer fields,
 * shared by “uint” and “int” to reduce duplication.
 */
function parseBigNumber(
    table: DotTable,
    body: Slice,
    name: string | undefined,
    format: Maybe<string | number | boolean>,
    optional: Maybe<boolean>,
    loadMethod: (bits: number) => bigint,
    loadMaybeMethod: (bits: number) => bigint | null,
): void {
    const fieldName = name ?? LABEL_UNKNOWN;
    console.log(`Parse number ${fieldName}: ${format}`);

    // If format === 'coins', interpret as TON coins
    if (format === 'coins') {
        const value = optional ? body.loadMaybeCoins() : body.loadCoins();
        table.addPair(fieldName, fromNano(value ?? 0n));
        return;
    }

    // Otherwise parse big (u)int with given bitSize (default to 256 if not specified)
    const bitSize = Number(format) || 256;
    const val = optional ? loadMaybeMethod(bitSize) : loadMethod(bitSize);
    if (!val) return;

    const valStr = val.toString();
    if (valStr.length > 40) {
        const hexStr = val.toString(16);
        table.addPair(fieldName, `${hexStr.slice(0, 6)}...${hexStr.slice(-6)}`);
    } else {
        table.addMaybePair(fieldName, valStr);
    }
}

/** --------------------------------------------------------------------------
 * TransactionVisualizer
 * -------------------------------------------------------------------------- */
export class TransactionVisualizer {
    private contractNames: Map<string, string> = new Map();
    private typeHeaders: Map<string, string> = new Map();
    private typeParsers: Map<string, TypeParser> = new Map();

    public constructor() {
        this.createBaseParsers();
    }

    public addContract(name: string, contract: Contract) {
        this.addContractName(name, contract.address);
        this.collectTypeHeaders(contract);
        this.registerContractTypes(contract);
    }

    public addContractName(name: string, address: Address) {
        this.contractNames.set(address.toString(), name);
    }

    /**
     * Create the base (built-in) type parsers. These can be extended
     * when you add custom contract ABIs (via addContracts).
     */
    private createBaseParsers() {
        const typeParsers = new Map<string, TypeParser>();

        typeParsers.set('uint', (table, body, name, format, optional) => {
            parseBigNumber(
                table,
                body,
                name,
                format,
                optional,
                (bits) => body.loadUintBig(bits),
                (bits) => body.loadMaybeUintBig(bits),
            );
        });

        typeParsers.set('int', (table, body, name, format, optional) => {
            parseBigNumber(
                table,
                body,
                name,
                format,
                optional,
                (bits) => body.loadIntBig(bits),
                (bits) => body.loadMaybeIntBig(bits),
            );
        });

        typeParsers.set('bool', (table, body, name, _format, optional) => {
            const fieldName = name ?? LABEL_UNKNOWN;
            console.log(`Parse bool ${fieldName}: ${_format}`);
            const value = optional ? body.loadMaybeBoolean() : body.loadBoolean();
            table.addMaybePair(fieldName, value?.toString());
        });

        typeParsers.set('address', (table, body, name, _format, optional) => {
            const fieldName = name ?? LABEL_UNKNOWN;
            console.log(`Parse address ${fieldName}: ${_format}`);
            const addr = optional ? body.loadMaybeAddress() : body.loadAddress();
            const knownName = addr ? (this.contractNames.get(addr.toString()) ?? addr.toString()) : undefined;
            table.addMaybePair(fieldName, knownName);
        });

        // For 'slice' and 'cell', just skip one ref if format !== 'remainder'
        typeParsers.set('slice', (_table, body, _name, format, optional) => {
            console.log(`Parse slice ${_name}: ${format}`);
            if (optional) body.loadMaybeRef();
            else if (format !== 'remainder') body.loadRef();
        });
        typeParsers.set('cell', (_table, body, _name, format, optional) => {
            console.log(`Parse cell ${_name}: ${format}`);
            if (optional) body.loadMaybeRef();
            else if (format !== 'remainder') body.loadRef();
        });

        this.typeParsers = typeParsers;
    }

    public async visualizeTransactions(
        name: string,
        txs: BlockchainTransaction[],
        before: BlockchainSnapshot,
        after: BlockchainSnapshot,
    ): Promise<void> {
        await this.visualizeTransactionsSimplified(`${name}(Simplified)`, txs, before, after);
        await this.visualizeTransactionsDetailed(`${name}`, txs, before, after);
        fs.writeFile(`${OUTPUT_DIR}/${name}.json`, JSON.stringify({
            contractNames: Object.fromEntries(this.contractNames.entries()),
            typeHeaders: Object.fromEntries(this.typeHeaders.entries())
        }), () => { });
    }

    public async visualizeTransactionsSimplified(
        name: string,
        txs: BlockchainTransaction[],
        before: BlockchainSnapshot,
        after: BlockchainSnapshot,
    ): Promise<void> {
        const graph = new Digraph('Transactions', {
            splines: 'ortho',
            concentrate: true,
            overlap: false,
            bgcolor: '#181818',
            rankdir: 'TB'
        });
        const subgraph = new Subgraph('TransactionsInner');

        // Build each transaction node
        for (const tx of txs) {
            const src = tx.inMessage?.info.src?.toString() ?? '(Entry)';
            const dest = tx.inMessage?.info.dest?.toString() ?? '(External)';

            // Ensure contract nodes exist
            this.addContractNode(subgraph, src, before, after, { simplified: true });
            this.addContractNode(subgraph, dest, before, after, { simplified: true });

            // Build transaction node
            const txNode = this.buildTransactionNodeSimplified(tx);
            subgraph.addNode(txNode);

            // Link source -> transaction -> destination
            const srcNode = subgraph.getNode(src)!;
            const destNode = subgraph.getNode(dest)!;
            subgraph.addEdge(new Edge([srcNode, txNode], EDGE_CONFIG));
            subgraph.addEdge(new Edge([txNode, destNode], EDGE_CONFIG));
        }

        // Finalize the graph
        graph.addSubgraph(subgraph);
        await toFile(toDot(graph), `${OUTPUT_DIR}/${name}.${FILE_FORMAT}`, { format: FILE_FORMAT });
    }


    public async visualizeTransactionsDetailed(
        name: string,
        txs: BlockchainTransaction[],
        before: BlockchainSnapshot,
        after: BlockchainSnapshot,
    ): Promise<void> {
        const graph = new Digraph('Transactions', {
            splines: 'ortho',
            concentrate: true,
            overlap: false,
            bgcolor: '#181818',
            rankdir: 'LR'
        });
        const subgraph = new Subgraph('TransactionsInner');

        // Build each transaction node
        for (const tx of txs) {
            const hash = tx.hash().toString('hex');
            const src = tx.inMessage?.info.src?.toString() ?? '(Entry)';
            const dest = tx.inMessage?.info.dest?.toString() ?? '(External)';

            // Ensure contract nodes exist
            this.addContractNode(subgraph, src, before, after);
            this.addContractNode(subgraph, dest, before, after);

            // Build transaction node
            const txNode = this.buildTransactionNode(tx);
            subgraph.addNode(txNode);

            // Build logs node (if any)
            const logsNode = this.buildLogsNode(tx, hash);
            if (logsNode) {
                subgraph.addNode(logsNode);
                subgraph.addEdge(new Edge([txNode, logsNode], EDGE_CONFIG));
            }

            // Link source -> transaction -> destination
            const srcNode = subgraph.getNode(src)!;
            const destNode = subgraph.getNode(dest)!;
            subgraph.addEdge(new Edge([srcNode, txNode], EDGE_CONFIG));
            subgraph.addEdge(new Edge([txNode, destNode], EDGE_CONFIG));
        }

        // Finalize the graph
        graph.addSubgraph(subgraph);
        await toFile(toDot(graph), `${OUTPUT_DIR}/${name}.${FILE_FORMAT}`, { format: FILE_FORMAT });
    }

    /** ----------------------------------------------------------------------
     * Internal Helper Methods
     * ---------------------------------------------------------------------- */

    private collectTypeHeaders(contract: Contract): void {
        contract.abi?.types?.forEach((ty) => {
            if (ty.header) {
                this.typeHeaders.set(ty.header.toString(16), ty.name);
            }
        });
    }

    private registerContractTypes(contract: Contract): void {
        contract.abi?.types?.forEach((ty) => {
            if (this.typeParsers.has(ty.name)) return;

            this.typeParsers.set(ty.name, (table, body, _fieldName, format, optional) => {
                console.log(`Parse ${ty.name} ${_fieldName}: ${format}`);
                // If optional bit not present, skip
                if (optional && !body.loadBit()) return;

                // Validate header
                if (ty.header) {
                    const headerVal = body.loadUint(32);
                    if (ty.header !== headerVal) {
                        throw new Error(
                            `Wrong header: ${ty.header.toString(16)} != ${headerVal.toString(16)}`,
                        );
                    }
                }

                // If entire object is in a ref
                if (format === 'ref') {
                    body = body.loadRef().asSlice();
                }

                // Parse each field in this custom type
                for (const field of ty.fields) {
                    if (field.type.kind === 'simple') {
                        const parser = this.typeParsers.get(field.type.type);
                        if (!parser) {
                            throw new Error(
                                `Parser for ${field.type.type}:${field.type.format} not found`,
                            );
                        }
                        parser(table, body, field.name, field.type.format, field.type.optional);
                    } else if (field.type.kind === 'dict') {
                        this.parseDictionaryField(table, body, field);
                    }
                }
            });
        });
    }

    private parseDictionaryField(table: DotTable, body: Slice, field: any): void {
        const fty = field.type;
        if (fty.format) {
            throw new Error(`Dictionary formats not supported: ${fty.format}`);
        }

        let keyParser;
        switch (fty.key) {
            case 'uint':
                keyParser = Dictionary.Keys.BigUint(fty.keyFormat as number);
                break;
            case 'int':
                keyParser = Dictionary.Keys.BigInt(fty.keyFormat as number);
                break;
            case 'address':
                keyParser = Dictionary.Keys.Address();
                break;
            default:
                throw new Error(`Invalid key type ${fty.key}:${fty.keyFormat}`);
        }

        body.loadDict(
            {
                bits: (fty.keyFormat as number) || 267,
                parse: (src: any) => src,
                serialize: (src: bigint) => src,
            },
            {
                parse: (src: Slice) => {
                    const valParser = this.typeParsers.get(fty.value);
                    if (!valParser) {
                        throw new Error(`Parser for ${fty.value}:${fty.valueFormat} not found`);
                    }
                    valParser(table, src, field.name, fty.valueFormat);
                },
                serialize: (_src, _builder) => {
                    // not needed for visualization
                },
            },
        );
    }

    private getContractBalance(snap: BlockchainSnapshot, address: string): bigint {
        const c = snap.contracts.find((cc) => cc.address.toString() === address);
        return c?.account.account?.storage.balance.coins ?? 0n;
    }

    private addContractNode(
        subgraph: Subgraph,
        address: string,
        before: BlockchainSnapshot,
        after: BlockchainSnapshot,
        opts?: { simplified?: boolean }
    ): void {
        if (subgraph.existNode(address)) return;

        const balanceBefore = this.getContractBalance(before, address);
        const balanceAfter = this.getContractBalance(after, address);
        const diff = balanceAfter - balanceBefore;
        const name = this.contractNames.get(address);
        const balances = `${fromNano(balanceBefore)} -> ${fromNano(balanceAfter)}: ${fromNano(diff)}`;
        let label = '';
        if (opts?.simplified) {
            label += name ?? address;
        } else {
            if (name) {
                label += name + '\n';
            }
            label += address + '\n';
            label += balances;
        }

        subgraph.addNode(
            new Node(address, {
                shape: 'box',
                label: label,
                ...NODE_CONFIG
            }),
        );
    }

    private buildTransactionNodeSimplified(tx: BlockchainTransaction): Node {
        const hash = tx.hash().toString('hex');
        if (!tx.inMessage) throw new Error("Transaction without inMessage");
        let typeName;
        if (tx.inMessage?.body?.bits.length < 32) {
            typeName = 'Empty';
        } else {
            const typeId = tx.inMessage?.body?.beginParse().preloadUint(32).toString(16);
            typeName = this.typeHeaders.get(typeId) ?? typeId;
        }

        return new Node(hash, {
            margin: 0,
            shape: 'none',
            label: `${typeName}`,
            ...NODE_CONFIG
        });
    }

    private buildTransactionNode(tx: BlockchainTransaction): Node {
        const hash = tx.hash().toString('hex');
        const desc = tx.description.type === 'generic' ? tx.description : undefined;
        const compute = desc?.computePhase.type === 'vm' ? desc.computePhase : undefined;
        const action = desc?.actionPhase;

        const table = DotTable.empty();
        table.addPair('Hash', `${hash.slice(0, 8)}...${hash.slice(-8)}`);
        table.addPair('Fee', fromNano(tx.totalFees.coins));
        table.addPair('Out messages', tx.outMessagesCount.toString());

        if (desc) {
            table.addBool('Aborted', desc.aborted, { color: 'red', bold: true });
            table.addBool('Destroyed', desc.destroyed);
        }

        if (compute) {
            if (compute.exitCode) {
                table.addPair('Compute(code)', compute.exitCode.toString(), { color: 'red', bold: true });
            }
            table.addBool('Compute(failed)', !compute.success, { color: 'red', bold: true });
            table.addPair('Compute(gas)', compute.gasUsed.toString());
        }

        if (action) {
            if (action.resultCode) {
                table.addPair('Action(code)', action.resultCode.toString(), { color: 'red', bold: true });
            }
            table.addBool('Action(failed)', !action.success);
            table.addBool('Action(no funds)', action.noFunds);
            table.addPair('Action(actions)', action.totalActions.toString());
            table.addPair('Action(messages)', action.messagesCreated.toString());
            table.addPair('Action(size)', `${action.totalMessageSize.bits}:${action.totalMessageSize.cells}`);
            table.addPair('Action(fee)', fromNano(action.totalActionFees?.toString() ?? 0));
            table.addPair('Action(FWD fee)', fromNano(action.totalFwdFees?.toString() ?? 0));
        }

        this.buildInboundMessageTable(tx, table);

        return new Node(hash, {
            margin: 0,
            shape: 'none',
            label: `<${table.render()}>`,
            ...NODE_CONFIG
        });
    }

    private buildInboundMessageTable(tx: BlockchainTransaction, table: DotTable): void {
        if (!tx.inMessage) return;

        table.addHDivider();
        table.addPair(' ', ' '); // small visual spacing

        const info = tx.inMessage.info.type === 'internal' ? tx.inMessage.info : undefined;
        if ((tx.inMessage.body.bits.length ?? 0) < 32) {
            table.addPair('Message', 'Empty', { bold: true });
        } else {
            this.parseMessageBody(tx.inMessage.body.beginParse(), table);
        }

        if (info) {
            table.addPair(`[In] Value`, fromNano(info.value.coins), { color: 'darkcyan' });
            table.addPair(`[In] FWD Fee`, fromNano(info.forwardFee));
            table.addPair(`[In] Created lt`, info.createdLt.toString());
            table.addBool(`[In] Bounced`, info.bounced, { color: 'red', bold: true });
        }
    }

    private parseMessageBody(body: Slice, table: DotTable): void {
        const typeId = body.preloadUint(32).toString(16);
        const typeName = this.typeHeaders.get(typeId);
        if (!typeName) {
            table.addPair('Message(id)', typeId, { bold: true });
            return;
        }
        table.addPair('Message', typeName, { bold: true });

        const parser = this.typeParsers.get(typeName);
        try {
            if (parser) parser(table, body);
        } catch (e) {
            console.log(`Failed to parse ${typeName}: ${e}`);
            throw e;
        }
    }

    private buildLogsNode(tx: BlockchainTransaction, txHash: string): Node | null {
        if (!tx.debugLogs.length) return null;

        const logsText = tx.debugLogs
            .split('\n')
            .filter((ln) => !ln.includes('dump(') && !ln.includes('File contracts/'))
            .map((line) => line.replace('#DEBUG#: ', ''))
            .map((val) => {
                if (/^\d+$/.test(val)) {
                    return fromNano(val);
                } else if (Address.isFriendly(val)) {
                    return this.contractNames.get(val) ?? val;
                }
                return val;
            })
            .join('\n');

        return new Node(`${txHash}_logs`, {
            label: logsText,
            shape: 'box',
            ...NODE_CONFIG
        });
    }
}
