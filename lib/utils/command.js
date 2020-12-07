"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchesByTag = void 0;
const github_action_helper_1 = require("@technote-space/github-action-helper");
const github_action_log_helper_1 = require("@technote-space/github-action-log-helper");
const command = new github_action_helper_1.Command(new github_action_log_helper_1.Logger());
const { execAsync } = command;
const getBranchesByTag = async (tagName) => (await execAsync({ command: `git branch -a --contains ${tagName} | cut -b 3-` })).stdout
    .trim()
    .split(/\r?\n/)
    .filter(item => item)
    .map(item => item.replace(/^remotes\/origin\//, ''));
exports.getBranchesByTag = getBranchesByTag;
