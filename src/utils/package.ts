import fs from 'fs';
import { GitHub } from '@actions/github/lib/github';
import { Context } from '@actions/github/lib/context';
import { Utils, ApiHelper, Logger } from '@technote-space/github-action-helper';
import replace from 'replace-in-file';
import {
	getPackageDir,
	getPackageFileName,
	getPackagePath,
	getPackageVersion,
	isRequiredUpdate,
	getPackageVersionToUpdate,
	getReplaceResultMessages,
	getCommitMessage,
} from './misc';

const {getTagName} = Utils;
const logger = new Logger();
const helper = new ApiHelper(logger);

export const updatePackageVersion = async(context: Context): Promise<boolean> => {
	const path = getPackagePath();
	if (!fs.existsSync(path)) {
		logger.warn('File [package.json] not found.');
		return false;
	}

	const tagName = getTagName(context);
	if (!isRequiredUpdate(getPackageVersion(), tagName)) {
		return false;
	}

	logger.startProcess('Updating package version');
	const version = getPackageVersionToUpdate(tagName);
	logger.displayStdout(getReplaceResultMessages(await replace({
		files: path,
		from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
		to: `"version": "$1${version}"$2`,
	})));

	return true;
};

export const commit = async(octokit: GitHub, context: Context): Promise<boolean> => await helper.commit(getPackageDir(), getCommitMessage(), [getPackageFileName()], octokit, context);
