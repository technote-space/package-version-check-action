"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const github_action_helper_1 = require("@technote-space/github-action-helper");
const { getTagName, isSemanticVersioningTagName } = github_action_helper_1.Utils;
exports.DEFAULT_COMMIT_MESSAGE = 'feat: Update package version';
exports.DEFAULT_PACKAGE_NAME = 'package.json';
exports.DEFAULT_TEST_TAG_PREFIX = '';
exports.TARGET_EVENTS = {
    'push': [
        (context) => /^refs\/tags\//.test(context.ref) && isSemanticVersioningTagName(getTagName(context)),
    ],
};
