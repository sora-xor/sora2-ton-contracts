import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/ton_app.tact',
    options: {
        debug: true,
    },
};
