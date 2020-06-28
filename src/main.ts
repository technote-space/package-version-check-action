import {resolve} from 'path';
import {setFailed} from '@actions/core';
import {Context} from '@actions/github/lib/context';
import {isTargetEvent} from '@technote-space/filter-github-action';
import {Logger, ContextHelper, Utils} from '@technote-space/github-action-helper';
import {updatePackageVersion, commit} from './utils/package';
import {TARGET_EVENTS} from './constant';

const run = async(): Promise<void> => {
  const logger  = new Logger();
  const context = new Context();
  ContextHelper.showActionInfo(resolve(__dirname, '..'), logger, context);

  if (!isTargetEvent(TARGET_EVENTS, context)) {
    logger.info('This is not target event.');
    return;
  }

  if (await updatePackageVersion(context)) {
    await commit(Utils.getOctokit(), context);
  }
};

run().catch(error => {
  console.log(error);
  setFailed(error.message);
});
