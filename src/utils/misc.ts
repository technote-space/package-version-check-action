import fs from 'fs';
import path from 'path';
import { getInput } from '@actions/core' ;
import { Utils } from '@technote-space/github-action-helper';
import { ReplaceResult } from 'replace-in-file';
import colors from 'colors/safe';
import { DEFAULT_COMMIT_MESSAGE, DEFAULT_PACKAGE_NAME } from '../constant';

const {getWorkspace} = Utils;

const normalizeVersion = (version: string): string => version.replace(/^v/, '');

export const getPackageDir = (): string => getInput('PACKAGE_DIR') || getWorkspace();

export const getPackageFileName = (): string => getInput('PACKAGE_NAME') || DEFAULT_PACKAGE_NAME;

export const getPackagePath = (): string => path.resolve(getPackageDir(), getPackageFileName());

export const getPackageData = (): object => JSON.parse(fs.readFileSync(getPackagePath(), {encoding: 'utf-8'}));

export const getPackageVersion = (): string => getPackageData()['version'];

export const isRequiredUpdate = (packageVersion: string, tagVersion: string): boolean => normalizeVersion(packageVersion) !== normalizeVersion(tagVersion);

export const getPackageVersionToUpdate = (tagVersion: string): string => normalizeVersion(tagVersion);

export const getReplaceResultMessages = (results: ReplaceResult[]): string[] => results.map(result => `${result.hasChanged ? colors.green('✔') : colors.red('✖')} ${result.file}`);

export const getCommitMessage = (): string => getInput('COMMIT_MESSAGE') || DEFAULT_COMMIT_MESSAGE;
