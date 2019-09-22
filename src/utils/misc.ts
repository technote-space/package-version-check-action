import fs from 'fs';
import path from 'path';
import { getInput } from '@actions/core' ;
import { Utils } from '@technote-space/github-action-helper';
import { ReplaceResult } from 'replace-in-file';
import colors from 'colors/safe';
import { DEFAULT_COMMIT_MESSAGE, DEFAULT_PACKAGE_NAME, DEFAULT_TEST_TAG_PREFIX } from '../constant';

const {getWorkspace, escapeRegExp} = Utils;

const normalizeVersion = (version: string): string => version.replace(/^v/, '');

export const getPackageDir = (): string => getInput('PACKAGE_DIR') || getWorkspace();

export const getPackageFileName = (): string => getInput('PACKAGE_NAME') || DEFAULT_PACKAGE_NAME;

export const getPackagePath = (): string => path.resolve(getPackageDir(), getPackageFileName());

export const getPackageData = (): object => JSON.parse(fs.readFileSync(getPackagePath(), {encoding: 'utf-8'}));

export const getPackageVersion = (): string => getPackageData()['version'];

export const getTestTagPrefix = (): string => getInput('TEST_TAG_PREFIX') || DEFAULT_TEST_TAG_PREFIX;

const getTestTagPrefixRegExp = (): RegExp => new RegExp('^' + escapeRegExp(getTestTagPrefix()));

export const isTestTag = (tagName: string): boolean => !!getTestTagPrefix() && getTestTagPrefixRegExp().test(tagName);

export const getTestTag = (tagName: string): string => tagName.replace(getTestTagPrefixRegExp(), '');

export const getPackageVersionToUpdate = (tagVersion: string): string => normalizeVersion(isTestTag(tagVersion) ? getTestTag(tagVersion) : tagVersion);

export const isRequiredUpdate = (packageVersion: string, tagVersion: string): boolean => normalizeVersion(packageVersion) !== getPackageVersionToUpdate(tagVersion);

export const getReplaceResultMessages = (results: ReplaceResult[]): string[] => results.map(result => `${result.hasChanged ? colors.green('✔') : colors.red('✖')} ${result.file}`);

export const getCommitMessage = (): string => getInput('COMMIT_MESSAGE') || DEFAULT_COMMIT_MESSAGE;
