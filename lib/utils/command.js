"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBranchesByTag = void 0;
const github_action_helper_1 = require("@technote-space/github-action-helper");
const github_action_log_helper_1 = require("@technote-space/github-action-log-helper");
const command = new github_action_helper_1.Command(new github_action_log_helper_1.Logger());
const { execAsync } = command;
const getBranchesByTag = (tagName) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield execAsync({ command: `git branch -a --contains ${tagName} | cut -b 3-` })).stdout
        .trim()
        .split(/\r?\n/)
        .filter(item => item)
        .map(item => item.replace(/^remotes\/origin\//, ''));
});
exports.getBranchesByTag = getBranchesByTag;
