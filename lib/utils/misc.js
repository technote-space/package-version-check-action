"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@actions/core");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const { getWorkspace, escapeRegExp, isSemanticVersioningTagName, getBoolValue } = github_action_helper_1.Utils;
const normalizeVersion = (version) => version.replace(/^v/, '');
exports.getPackageDir = () => core_1.getInput('PACKAGE_DIR') || getWorkspace();
exports.getBranchPrefix = () => core_1.getInput('BRANCH_PREFIX');
const getBranchPrefixRegExp = () => new RegExp('^' + escapeRegExp(exports.getBranchPrefix()));
const getVersionFromBranch = (branch) => branch.replace(getBranchPrefixRegExp(), '');
exports.isValidBranch = (branch) => !!exports.getBranchPrefix() && getBranchPrefixRegExp().test(branch) && isSemanticVersioningTagName(getVersionFromBranch(branch));
exports.getPackageFileName = () => core_1.getInput('PACKAGE_NAME', { required: true });
exports.getPackagePath = () => path_1.default.resolve(exports.getPackageDir(), exports.getPackageFileName());
exports.getPackageData = () => JSON.parse(fs_1.default.readFileSync(exports.getPackagePath(), { encoding: 'utf-8' }));
exports.getPackageVersion = () => exports.getPackageData()['version'];
exports.getTestTagPrefix = () => core_1.getInput('TEST_TAG_PREFIX');
const getTestTagPrefixRegExp = () => new RegExp('^' + escapeRegExp(exports.getTestTagPrefix()));
exports.isTestTag = (tagName) => !!exports.getTestTagPrefix() && getTestTagPrefixRegExp().test(tagName);
exports.getTestTag = (tagName) => tagName.replace(getTestTagPrefixRegExp(), '');
exports.getPackageVersionToUpdate = (tagName) => normalizeVersion(exports.isTestTag(tagName) ? exports.getTestTag(tagName) : tagName);
exports.isRequiredUpdate = (packageVersion, tagName) => normalizeVersion(packageVersion) !== exports.getPackageVersionToUpdate(tagName);
exports.isValidTagName = (tagName) => isSemanticVersioningTagName(exports.getPackageVersionToUpdate(tagName));
exports.getReplaceResultMessages = (results) => results.map(result => `${result.hasChanged ? '✔' : '✖'} ${result.file}`);
exports.getCommitMessage = () => core_1.getInput('COMMIT_MESSAGE', { required: true });
exports.isCommitDisabled = () => getBoolValue(core_1.getInput('COMMIT_DISABLED'));
exports.getDefaultBranch = (context) => context.payload.repository ? context.payload.repository.default_branch : undefined;
exports.getTagName = (context) => {
    const tagName = github_action_helper_1.ContextHelper.getTagName(context);
    if (tagName) {
        return tagName;
    }
    return getVersionFromBranch(github_action_helper_1.Utils.getBranch(context));
};
exports.isValidTagNameContext = (context) => exports.isValidTagName(github_action_helper_1.ContextHelper.getTagName(context));
exports.isValidBranchContext = (context) => exports.isValidBranch(github_action_helper_1.Utils.getBranch(context));
exports.isValidContext = (context) => exports.isValidTagNameContext(context) || exports.isValidBranchContext(context);
