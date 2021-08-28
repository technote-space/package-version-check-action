"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidContext = exports.isValidBranchContext = exports.isValidTagNameContext = exports.getTagName = exports.isSpecifiedNextVersion = exports.getNextVersion = exports.getBranch = exports.getDefaultBranch = exports.isCommitDisabled = exports.getCommitMessage = exports.getReplaceResultMessages = exports.isValidTagName = exports.isRequiredUpdate = exports.getPackageVersionToUpdate = exports.getTestTag = exports.isTestTag = exports.getTestTagPrefix = exports.getPackageVersion = exports.getPackageData = exports.getPackagePath = exports.getPackageFileName = exports.isValidBranch = exports.getBranchPrefix = exports.getPackageDir = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const core_1 = require("@actions/core");
const github_action_helper_1 = require("@technote-space/github-action-helper");
const { getWorkspace, isValidSemanticVersioning, getBoolValue, getPrefixRegExp } = github_action_helper_1.Utils;
const normalizeVersion = (version) => { var _a; return (_a = github_action_helper_1.Utils.normalizeVersion(version)) !== null && _a !== void 0 ? _a : ''; };
const getPackageDir = () => (0, core_1.getInput)('PACKAGE_DIR') || getWorkspace();
exports.getPackageDir = getPackageDir;
const getBranchPrefix = () => (0, core_1.getInput)('BRANCH_PREFIX');
exports.getBranchPrefix = getBranchPrefix;
const getBranchPrefixRegExp = () => getPrefixRegExp((0, exports.getBranchPrefix)());
const getVersionFromBranch = (branch) => branch.replace(getBranchPrefixRegExp(), '');
const isValidBranch = (branch) => !!(0, exports.getBranchPrefix)() && getBranchPrefixRegExp().test(branch) && isValidSemanticVersioning(getVersionFromBranch(branch));
exports.isValidBranch = isValidBranch;
const getPackageFileName = () => (0, core_1.getInput)('PACKAGE_NAME', { required: true });
exports.getPackageFileName = getPackageFileName;
const getPackagePath = () => path_1.default.resolve((0, exports.getPackageDir)(), (0, exports.getPackageFileName)());
exports.getPackagePath = getPackagePath;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getPackageData = () => JSON.parse(fs_1.default.readFileSync((0, exports.getPackagePath)(), { encoding: 'utf-8' }));
exports.getPackageData = getPackageData;
const getPackageVersion = () => (0, exports.getPackageData)()['version'];
exports.getPackageVersion = getPackageVersion;
const getTestTagPrefix = () => (0, core_1.getInput)('TEST_TAG_PREFIX');
exports.getTestTagPrefix = getTestTagPrefix;
const getTestTagPrefixRegExp = () => getPrefixRegExp((0, exports.getTestTagPrefix)());
const isTestTag = (tagName) => !!(0, exports.getTestTagPrefix)() && getTestTagPrefixRegExp().test(tagName);
exports.isTestTag = isTestTag;
const getTestTag = (tagName) => tagName.replace(getTestTagPrefixRegExp(), '');
exports.getTestTag = getTestTag;
const getPackageVersionToUpdate = (tagName) => normalizeVersion((0, exports.isTestTag)(tagName) ? (0, exports.getTestTag)(tagName) : tagName);
exports.getPackageVersionToUpdate = getPackageVersionToUpdate;
const isRequiredUpdate = (packageVersion, tagName) => normalizeVersion(packageVersion) !== (0, exports.getPackageVersionToUpdate)(tagName);
exports.isRequiredUpdate = isRequiredUpdate;
const isValidTagName = (tagName) => isValidSemanticVersioning((0, exports.getPackageVersionToUpdate)(tagName));
exports.isValidTagName = isValidTagName;
const getReplaceResultMessages = (results, logger) => results.map(result => `${result.hasChanged ? logger.c('✔', { color: 'green' }) : logger.c('✖', { color: 'red' })} ${result.file}`);
exports.getReplaceResultMessages = getReplaceResultMessages;
const getCommitMessage = () => (0, core_1.getInput)('COMMIT_MESSAGE', { required: true });
exports.getCommitMessage = getCommitMessage;
const isCommitDisabled = () => getBoolValue((0, core_1.getInput)('COMMIT_DISABLED'));
exports.isCommitDisabled = isCommitDisabled;
const getDefaultBranch = (context) => context.payload.repository ? context.payload.repository.default_branch : undefined;
exports.getDefaultBranch = getDefaultBranch;
const getBranch = (context) => github_action_helper_1.ContextHelper.isPr(context) ? github_action_helper_1.Utils.getPrBranch(context) : github_action_helper_1.Utils.getBranch(context);
exports.getBranch = getBranch;
const getNextVersion = () => {
    const version = (0, core_1.getInput)('NEXT_VERSION');
    if ((0, exports.isValidTagName)(version)) {
        return version;
    }
    return '';
};
exports.getNextVersion = getNextVersion;
const isSpecifiedNextVersion = () => !!(0, exports.getNextVersion)();
exports.isSpecifiedNextVersion = isSpecifiedNextVersion;
const getTagName = (context) => {
    const nextVersion = (0, exports.getNextVersion)();
    if (nextVersion) {
        return nextVersion;
    }
    const tagName = github_action_helper_1.ContextHelper.getTagName(context);
    if (tagName) {
        return tagName;
    }
    return getVersionFromBranch((0, exports.getBranch)(context));
};
exports.getTagName = getTagName;
const isValidTagNameContext = (context) => (0, exports.isValidTagName)(github_action_helper_1.ContextHelper.getTagName(context));
exports.isValidTagNameContext = isValidTagNameContext;
const isValidBranchContext = (context) => (0, exports.isValidBranch)((0, exports.getBranch)(context));
exports.isValidBranchContext = isValidBranchContext;
const isValidContext = (context) => (0, exports.isSpecifiedNextVersion)() || (0, exports.isValidTagNameContext)(context) || (0, exports.isValidBranchContext)(context);
exports.isValidContext = isValidContext;
