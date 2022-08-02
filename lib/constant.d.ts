import { Context } from '@actions/github/lib/context';
export declare const TARGET_EVENTS: {
    create: ((context: Context) => boolean)[];
    pull_request: (string | ((context: Context) => boolean))[][];
    release: (string | ((context: Context) => boolean))[][];
    push: ((context: Context) => boolean)[];
};
