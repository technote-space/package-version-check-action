import type { Context } from '@actions/github/lib/context';
import type { Octokit } from '@technote-space/github-action-helper/dist/types';
import type { Logger } from '@technote-space/github-action-log-helper';
export declare const updatePackageVersion: (context: Context, logger: Logger) => Promise<boolean>;
export declare const getUpdateBranch: (logger: Logger, context: Context) => Promise<string | false>;
export declare const commit: (octokit: Octokit, context: Context, logger: Logger) => Promise<boolean>;
