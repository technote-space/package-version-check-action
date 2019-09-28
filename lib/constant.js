"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("./utils/misc");
exports.DEFAULT_COMMIT_MESSAGE = 'feat: Update package version';
exports.DEFAULT_PACKAGE_NAME = 'package.json';
exports.DEFAULT_TEST_TAG_PREFIX = '';
exports.TARGET_EVENTS = {
    'create': [
        (context) => misc_1.isValidTagNameContext(context),
    ],
    'release': [
        [
            'published',
            (context) => misc_1.isValidContext(context),
        ],
        [
            'rerequested',
            (context) => misc_1.isValidContext(context),
        ],
    ],
    'push': [
        (context) => misc_1.isValidContext(context),
    ],
};
