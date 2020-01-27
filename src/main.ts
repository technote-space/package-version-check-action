import path from 'path';
import { setFailed } from '@actions/core';
import { context, GitHub } from '@actions/github';
import { isTargetEvent } from '@technote-space/filter-github-action';
import { Logger, ContextHelper, Utils } from '@technote-space/github-action-helper';
import { updatePackageVersion, commit } from './utils/package';
import { TARGET_EVENTS } from './constant';

/**
 * run
 */
async function run(): Promise<void> {
	const logger = new Logger();
	ContextHelper.showActionInfo(path.resolve(__dirname, '..'), logger, context);

	if (!isTargetEvent(TARGET_EVENTS, context)) {
		logger.info('This is not target event.');
		return;
	}

	if (await updatePackageVersion(context)) {
		await commit(new GitHub(Utils.getAccessToken(true)), context);
	}
}

run().catch(error => setFailed(error.message));
