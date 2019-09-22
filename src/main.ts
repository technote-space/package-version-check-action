import path from 'path';
import { setFailed, getInput } from '@actions/core';
import { context, GitHub } from '@actions/github';
import { isTargetEvent } from '@technote-space/filter-github-action';
import { Logger, Utils } from '@technote-space/github-action-helper';
import { updatePackageVersion, commit } from './utils/package';
import { TARGET_EVENTS } from './constant';

const {showActionInfo} = Utils;

/**
 * run
 */
async function run(): Promise<void> {
	try {
		const logger = new Logger();
		showActionInfo(path.resolve(__dirname, '..'), logger, context);

		if (!isTargetEvent(TARGET_EVENTS, context)) {
			logger.info('This is not target event.');
			return;
		}

		if (await updatePackageVersion(context)) {
			await commit(new GitHub(getInput('GITHUB_TOKEN', {required: true})), context);
		}
	} catch (error) {
		setFailed(error.message);
	}
}

run();
