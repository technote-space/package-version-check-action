"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TARGET_EVENTS = void 0;
const misc_1 = require("./utils/misc");
exports.TARGET_EVENTS = {
    'create': [
        (context) => (0, misc_1.isValidTagNameContext)(context),
    ],
    'pull_request': [
        [
            'opened',
            (context) => (0, misc_1.isValidContext)(context),
        ],
        [
            'reopened',
            (context) => (0, misc_1.isValidContext)(context),
        ],
        [
            'synchronize',
            (context) => (0, misc_1.isValidContext)(context),
        ],
    ],
    'release': [
        [
            'published',
            (context) => (0, misc_1.isValidContext)(context),
        ],
    ],
    'push': [
        (context) => (0, misc_1.isValidContext)(context),
    ],
};
