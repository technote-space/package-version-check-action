"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commit = exports.getUpdateBranch = exports.updatePackageVersion = void 0;
const fs_1 = __importDefault(require("fs"));
const core_1 = require("@actions/core");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const github_action_log_helper_1 = require("@technote-space/github-action-log-helper");
const replace_in_file_1 = require("replace-in-file");
const misc_1 = require("./misc");
const command_1 = require("./command");
const logger = new github_action_log_helper_1.Logger();
const updatePackageVersion = async (context) => {
    logger.startProcess('Updating package version...');
    const path = (0, misc_1.getPackagePath)();
    if (!fs_1.default.existsSync(path)) {
        logger.warn(`File [${(0, misc_1.getPackageFileName)()}] not found.`);
        logger.warn('Please checkout before call this GitHub Action.');
        return false;
    }
    const tagName = (0, misc_1.getTagName)(context);
    const current = (0, misc_1.getPackageVersion)();
    logger.info('target version: %s', tagName);
    logger.info('current version: %s', current);
    if (!(0, misc_1.isRequiredUpdate)((0, misc_1.getPackageVersion)(), tagName)) {
        logger.info('No need to update.');
        return false;
    }
    const version = (0, misc_1.getPackageVersionToUpdate)(tagName);
    logger.displayStdout((0, misc_1.getReplaceResultMessages)(await (0, replace_in_file_1.replaceInFile)({
        files: path,
        from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
        to: `"version": "$1${version}"$2`,
    }), logger));
    return true;
};
exports.updatePackageVersion = updatePackageVersion;
const getUpdateBranch = async (logger, context) => {
    const tagName = github_action_helper_1.ContextHelper.getTagName(context);
    if (tagName) {
        const branch = (0, misc_1.getDefaultBranch)(context);
        if (undefined === branch) {
            logger.warn('Failed to get default branch name.');
            return false;
        }
        if (!(await (0, command_1.getBranchesByTag)(tagName)).includes(branch)) {
            logger.info('This is not default branch.');
            return false;
        }
        return branch;
    }
    return (0, misc_1.getBranch)(context);
};
exports.getUpdateBranch = getUpdateBranch;
const commit = async (octokit, context) => {
    logger.startProcess('Committing...');
    if ((0, misc_1.isCommitDisabled)()) {
        logger.info('Commit is disabled.');
        return true;
    }
    const branch = await (0, exports.getUpdateBranch)(logger, context);
    if (false === branch) {
        return false;
    }
    const helper = new github_action_helper_1.ApiHelper(octokit, context, logger, {
        branch: branch,
        refForUpdate: `heads/${branch}`,
        suppressBPError: true,
    });
    await helper.commit((0, misc_1.getPackageDir)(), (0, misc_1.getCommitMessage)(), [(0, misc_1.getPackageFileName)()]);
    (0, core_1.setOutput)('sha', process.env.GITHUB_SHA + '');
    return true;
};
exports.commit = commit;
