import type { Context } from '@actions/github/lib/context';
import type { Logger } from '@technote-space/github-action-log-helper';
import type { ReplaceResult } from 'replace-in-file';
import fs from 'fs';
import path from 'path';
import { getInput } from '@actions/core' ;
import { Utils, ContextHelper } from '@technote-space/github-action-helper';

const { getWorkspace, isValidSemanticVersioning, getBoolValue, getPrefixRegExp } = Utils;

const normalizeVersion = (version: string): string => Utils.normalizeVersion(version) ?? '';

export const getPackageDir = (): string => getInput('PACKAGE_DIR') || getWorkspace();

export const getBranchPrefix = (): string => getInput('BRANCH_PREFIX');

const getBranchPrefixRegExp = (): RegExp => getPrefixRegExp(getBranchPrefix());

const getVersionFromBranch = (branch: string): string => branch.replace(getBranchPrefixRegExp(), '');

export const isValidBranch = (branch: string): boolean => !!getBranchPrefix() && getBranchPrefixRegExp().test(branch) && isValidSemanticVersioning(getVersionFromBranch(branch));

export const getPackageFileName = (): string => getInput('PACKAGE_NAME', { required: true });

export const getPackagePath = (): string => path.resolve(getPackageDir(), getPackageFileName());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getPackageData = (): any => JSON.parse(fs.readFileSync(getPackagePath(), { encoding: 'utf-8' }));

export const getPackageVersion = (): string => getPackageData()['version'];

export const getTestTagPrefix = (): string => getInput('TEST_TAG_PREFIX');

const getTestTagPrefixRegExp = (): RegExp => getPrefixRegExp(getTestTagPrefix());

export const isTestTag = (tagName: string): boolean => !!getTestTagPrefix() && getTestTagPrefixRegExp().test(tagName);

export const getTestTag = (tagName: string): string => tagName.replace(getTestTagPrefixRegExp(), '');

export const getPackageVersionToUpdate = (tagName: string): string => normalizeVersion(isTestTag(tagName) ? getTestTag(tagName) : tagName);

export const isRequiredUpdate = (packageVersion: string, tagName: string): boolean => normalizeVersion(packageVersion) !== getPackageVersionToUpdate(tagName);

export const isValidTagName = (tagName: string): boolean => isValidSemanticVersioning(getPackageVersionToUpdate(tagName));

export const getReplaceResultMessages = (results: ReplaceResult[], logger: Logger): string[] => results.map(result => `${result.hasChanged ? logger.c('✔', { color: 'green' }) : logger.c('✖', { color: 'red' })} ${result.file}`);

export const getCommitMessage = (): string => getInput('COMMIT_MESSAGE', { required: true });

export const isCommitDisabled = (): boolean => getBoolValue(getInput('COMMIT_DISABLED'));

export const getDefaultBranch = (context: Context): string | undefined => context.payload.repository ? context.payload.repository.default_branch : undefined;

export const getBranch = (context: Context): string => ContextHelper.isPr(context) ? Utils.getPrBranch(context) : Utils.getBranch(context);

export const getNextVersion = (): string => {
  const version = getInput('NEXT_VERSION');
  if (isValidTagName(version)) {
    return version;
  }

  return '';
};

export const isSpecifiedNextVersion = (): boolean => !!getNextVersion();

export const getTagName = (context: Context): string => {
  const nextVersion = getNextVersion();
  if (nextVersion) {
    return nextVersion;
  }

  const tagName = ContextHelper.getTagName(context);
  if (tagName) {
    return tagName;
  }

  return getVersionFromBranch(getBranch(context));
};

export const isValidTagNameContext = (context: Context): boolean => isValidTagName(ContextHelper.getTagName(context));

export const isValidBranchContext = (context: Context): boolean => isValidBranch(getBranch(context));

export const isValidContext = (context: Context): boolean => isSpecifiedNextVersion() || isValidTagNameContext(context) || isValidBranchContext(context);
