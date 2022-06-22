import fs from 'fs';
import { setOutput } from '@actions/core';
import type { Context } from '@actions/github/lib/context';
import type { Octokit } from '@technote-space/github-action-helper/dist/types';
import { ApiHelper, ContextHelper } from '@technote-space/github-action-helper';
import type { Logger } from '@technote-space/github-action-log-helper';
import replaceInFile from 'replace-in-file';
import {
  getPackageDir,
  getPackageFileName,
  getPackagePath,
  getPackageVersion,
  isRequiredUpdate,
  getPackageVersionToUpdate,
  getReplaceResultMessages,
  getCommitMessage,
  getDefaultBranch,
  isCommitDisabled,
  getTagName,
  getBranch,
} from './misc';
import { getBranchesByTag } from './command';

export const updatePackageVersion = async(context: Context, logger: Logger): Promise<boolean> => {
  logger.startProcess('Updating package version...');

  const path = getPackagePath();
  if (!fs.existsSync(path)) {
    logger.warn(`File [${getPackageFileName()}] not found.`);
    logger.warn('Please checkout before call this GitHub Action.');
    return false;
  }

  const tagName = getTagName(context);
  const current = getPackageVersion();
  logger.info('target version: %s', tagName);
  logger.info('current version: %s', current);

  if (!isRequiredUpdate(getPackageVersion(), tagName)) {
    logger.info('No need to update.');
    return false;
  }

  const version = getPackageVersionToUpdate(tagName);
  logger.displayStdout(getReplaceResultMessages(await replaceInFile.replaceInFile({
    files: path,
    from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
    to: `"version": "$1${version}"$2`,
  }), logger));

  return true;
};

export const getUpdateBranch = async(logger: Logger, context: Context): Promise<string | false> => {
  const tagName = ContextHelper.getTagName(context);
  if (tagName) {
    const branch = getDefaultBranch(context);
    if (undefined === branch) {
      logger.warn('Failed to get default branch name.');
      return false;
    }

    if (!(await getBranchesByTag(tagName, logger)).includes(branch)) {
      logger.info('This is not default branch.');
      return false;
    }

    return branch;
  }

  return getBranch(context);
};

export const commit = async(octokit: Octokit, context: Context, logger: Logger): Promise<boolean> => {
  logger.startProcess('Committing...');

  if (isCommitDisabled()) {
    logger.info('Commit is disabled.');
    return true;
  }

  const branch = await getUpdateBranch(logger, context);
  if (false === branch) {
    return false;
  }

  const helper = new ApiHelper(octokit, context, logger, {
    refForUpdate: `heads/${branch}`,
    suppressBPError: true,
  });
  await helper.commit(getPackageDir(), getCommitMessage(), [getPackageFileName()]);
  setOutput('sha', process.env.GITHUB_SHA + '');
  return true;
};
