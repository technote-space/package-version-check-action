"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const core_1 = require("@actions/core");
const context_1 = require("@actions/github/lib/context");
const filter_github_action_1 = require("@technote-space/filter-github-action");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const github_action_log_helper_1 = require("@technote-space/github-action-log-helper");
const package_1 = require("./utils/package");
const constant_1 = require("./constant");
const run = async () => {
    const logger = new github_action_log_helper_1.Logger();
    const context = new context_1.Context();
    github_action_helper_1.ContextHelper.showActionInfo((0, path_1.resolve)(__dirname, '..'), logger, context);
    if (!(0, filter_github_action_1.isTargetEvent)(constant_1.TARGET_EVENTS, context)) {
        logger.info('This is not target event.');
        return;
    }
    if (await (0, package_1.updatePackageVersion)(context)) {
        await (0, package_1.commit)(github_action_helper_1.Utils.getOctokit(), context);
    }
};
run().catch(error => {
    console.log(error);
    (0, core_1.setFailed)(error.message);
});
