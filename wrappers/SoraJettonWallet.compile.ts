import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/sora_jetton/wallet.tact',
    options: {
        debug: true,
    },
};
