import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/channel/channel.tact',
    options: {
        debug: true,
    },
};
