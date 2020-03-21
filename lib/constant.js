"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const misc_1 = require("./utils/misc");
exports.TARGET_EVENTS = {
    'create': [
        (context) => misc_1.isValidTagNameContext(context),
    ],
    'pull_request': [
        [
            'opened',
            (context) => misc_1.isValidContext(context),
        ],
        [
            'reopened',
            (context) => misc_1.isValidContext(context),
        ],
        [
            'synchronize',
            (context) => misc_1.isValidContext(context),
        ],
    ],
    'release': [
        [
            'published',
            (context) => misc_1.isValidContext(context),
        ],
    ],
    'push': [
        (context) => misc_1.isValidContext(context),
    ],
};
