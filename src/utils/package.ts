import fs from 'fs';
import { GitHub } from '@actions/github/lib/github';
import { Context } from '@actions/github/lib/context';
import { ApiHelper, Logger, Utils } from '@technote-space/github-action-helper';
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
	getDefaultBranch,
	isCommitDisabled,
	getTagName,
} from './misc';
import { getBranchesByTag } from './command';

const logger = new Logger();

export const updatePackageVersion = async(context: Context): Promise<boolean> => {
	logger.startProcess('Updating package version...');

	const path = getPackagePath();
	if (!fs.existsSync(path)) {
		logger.warn(`File [${getPackageFileName()}] not found.`);
		logger.warn('Please checkout before call this GitHub Action.');
		return false;
	}

	const tagName = getTagName(context);
	if (!isRequiredUpdate(getPackageVersion(), tagName)) {
		logger.info('No update required.');
		return false;
	}

	const version = getPackageVersionToUpdate(tagName);
	logger.displayStdout(getReplaceResultMessages(await replace({
		files: path,
		from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
		to: `"version": "$1${version}"$2`,
	})));

	return true;
};

export const getBranch = async(logger: Logger, context: Context): Promise<string | false> => {
	const tagName = Utils.getTagName(context);
	if (tagName) {
		const branch = getDefaultBranch(context);
		if (undefined === branch) {
			logger.warn('Failed to get default branch name.');
			return false;
		}

		if (!(await getBranchesByTag(tagName)).includes(branch)) {
			logger.info('This is not default branch.');
			return false;
		}
		return branch;
	}

	return Utils.getBranch(context);
};

export const commit = async(octokit: GitHub, context: Context): Promise<boolean> => {
	logger.startProcess('Committing...');

	if (isCommitDisabled()) {
		logger.info('Commit is disabled.');
		return true;
	}

	const branch = await getBranch(logger, context);
	if (false === branch) {
		return false;
	}

	const helper = new ApiHelper(logger, {branch: branch, refForUpdate: `heads/${branch}`, suppressBPError: true});
	return await helper.commit(getPackageDir(), getCommitMessage(), [getPackageFileName()], octokit, context);
};
