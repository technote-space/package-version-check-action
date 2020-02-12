/* eslint-disable no-magic-numbers */
import path from 'path';
import { isTargetEvent } from '@technote-space/filter-github-action';
import { generateContext, testEnv } from '@technote-space/github-action-test-helper';
import {
	getPackageDir,
	getPackageFileName,
	getPackagePath,
	getPackageData,
	getPackageVersion,
	isTestTag,
	getTestTag,
	isValidTagName,
	isRequiredUpdate,
	getPackageVersionToUpdate,
	getReplaceResultMessages,
	getCommitMessage,
	getTagName,
} from '../../src/utils/misc';
import { TARGET_EVENTS } from '../../src/constant';

const rootDir = path.resolve(__dirname, '../..');

describe('isTargetEvent', () => {
	testEnv(rootDir);

	it('should return true 1', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'push',
			ref: 'tags/v1.2.3',
		}))).toBeTruthy();
	});

	it('should return true 2', () => {
		process.env.INPUT_BRANCH_PREFIX = 'release/';
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'push',
			ref: 'heads/release/v1.2.3',
		}))).toBeTruthy();
	});

	it('should return true 3', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'release',
			action: 'published',
		}, {
			payload: {
				release: {
					'tag_name': 'v1.2.3',
				},
			},
		}))).toBeTruthy();
	});

	it('should return true 4', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'release',
			action: 'rerequested',
		}, {
			payload: {
				release: {
					'tag_name': 'v1.2.3',
				},
			},
		}))).toBeTruthy();
	});

	it('should return true 5', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'create',
			ref: 'tags/v1.2.3',
		}))).toBeTruthy();
	});

	it('should return false 1', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'pull_request',
			ref: 'tags/test',
		}))).toBeFalsy();
	});

	it('should return false 2', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'push',
			ref: 'tags/test',
		}))).toBeFalsy();
	});

	it('should return false 3', () => {
		process.env.INPUT_BRANCH_PREFIX = 'release';
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'push',
			ref: 'heads/release/v1.2.3',
		}))).toBeFalsy();
	});

	it('should return false 4', () => {
		process.env.INPUT_BRANCH_PREFIX = 'release';
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'push',
			ref: 'heads/release/v1.2.3',
		}))).toBeFalsy();
	});

	it('should return false 5', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'release',
			action: 'published',
		}, {
			payload: {
				release: {
					'tag_name': 'abc',
				},
			},
		}))).toBeFalsy();
	});

	it('should return false 6', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'release',
			action: 'created',
			ref: 'tags/v1.2.3',
		}, {
			payload: {
				release: {
					'tag_name': 'v1.2.3',
				},
			},
		}))).toBeFalsy();
	});

	it('should return false 7', () => {
		expect(isTargetEvent(TARGET_EVENTS, generateContext({
			event: 'create',
			ref: 'heads/v1.2.3',
		}))).toBeFalsy();
	});
});

describe('getPackageDir', () => {
	testEnv(rootDir);

	it('should get package dir', () => {
		process.env.INPUT_PACKAGE_DIR = 'package-dir';
		process.env.GITHUB_WORKSPACE  = 'test';

		expect(getPackageDir()).toBe('package-dir');
	});

	it('should get default package dir', () => {
		process.env.GITHUB_WORKSPACE = 'test';

		expect(getPackageDir()).toBe('test');
	});
});

describe('getPackageFileName', () => {
	testEnv(rootDir);

	it('should get package file name', () => {
		process.env.INPUT_PACKAGE_NAME = 'test.json';
		expect(getPackageFileName()).toBe('test.json');
	});

	it('should get default package file name', () => {
		expect(getPackageFileName()).toBe('package.json');
	});
});

describe('getPackagePath', () => {
	testEnv(rootDir);

	it('should get package path', () => {
		process.env.GITHUB_WORKSPACE = 'test';

		const dir = path.resolve(__dirname, '..', '..');
		expect(getPackagePath()).toBe(`${dir}/test/package.json`);
	});
});

describe('getPackageData', () => {
	testEnv(rootDir);

	it('should get package data', () => {
		process.env.INPUT_PACKAGE_DIR  = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
		expect(getPackageData()).toEqual({
			'name': 'test',
			'version': '0.0.1',
			'description': 'test',
		});
	});
});

describe('getPackageVersion', () => {
	testEnv(rootDir);

	it('should get package version 1', () => {
		process.env.INPUT_PACKAGE_DIR  = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
		expect(getPackageVersion()).toBe('0.0.1');
	});

	it('should get package version 2', () => {
		process.env.INPUT_PACKAGE_DIR  = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test2.json';
		expect(getPackageVersion()).toBe('0.0.2');
	});

	it('should get package version 3', () => {
		process.env.INPUT_PACKAGE_DIR  = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test3.json';
		expect(getPackageVersion()).toBe('v0.0.3');
	});
});

describe('isTestTag', () => {
	testEnv(rootDir);

	it('should return true', () => {
		process.env.INPUT_TEST_TAG_PREFIX = 'test/';
		expect(isTestTag('test/v1.2.3')).toBe(true);
	});

	it('should return false', () => {
		process.env.INPUT_TEST_TAG_PREFIX = 'test/';
		expect(isTestTag('v1.2.3')).toBe(false);
	});
});

describe('getTestTag', () => {
	testEnv(rootDir);

	it('should get test tag', () => {
		process.env.INPUT_TEST_TAG_PREFIX = 'test/';
		expect(getTestTag('test/v1.2.3')).toBe('v1.2.3');
	});
});

describe('isValidTagName', () => {
	testEnv(rootDir);

	it('should return true 1', () => {
		expect(isValidTagName('1.2.3')).toBeTruthy();
		expect(isValidTagName('v1.2.3')).toBeTruthy();
	});

	it('should return true 2', () => {
		process.env.INPUT_TEST_TAG_PREFIX = 'test/';
		expect(isValidTagName('test/1.2.3')).toBeTruthy();
		expect(isValidTagName('test/v1.2.3')).toBeTruthy();
	});

	it('should return false 1', () => {
		expect(isValidTagName('test/1.2.3')).toBeFalsy();
		expect(isValidTagName('test/v1.2.3')).toBeFalsy();
		expect(isValidTagName('.2.3')).toBeFalsy();
		expect(isValidTagName('abc')).toBeFalsy();
		expect(isValidTagName('')).toBeFalsy();
	});

	it('should return false 2', () => {
		process.env.INPUT_TEST_TAG_PREFIX = 'test/';
		expect(isValidTagName('.2.3')).toBeFalsy();
		expect(isValidTagName('abc')).toBeFalsy();
		expect(isValidTagName('')).toBeFalsy();
	});
});

describe('isRequiredUpdate', () => {
	it('should return false', () => {
		expect(isRequiredUpdate('0.0.1', '0.0.1')).toBeFalsy();
		expect(isRequiredUpdate('v0.0.1', '0.0.1')).toBeFalsy();
		expect(isRequiredUpdate('0.0.1', 'v0.0.1')).toBeFalsy();
		expect(isRequiredUpdate('v0.0.1', 'v0.0.1')).toBeFalsy();
	});

	it('should return true', () => {
		expect(isRequiredUpdate('0.0.1', '0.0.2')).toBeTruthy();
		expect(isRequiredUpdate('0.0.1', 'v0.0.2')).toBeTruthy();
		expect(isRequiredUpdate('0.0.1', 'v0.1.0')).toBeTruthy();
	});
});

describe('getPackageVersionToUpdate', () => {
	testEnv(rootDir);

	it('should get version', () => {
		expect(getPackageVersionToUpdate('1.2.3')).toBe('1.2.3');
		expect(getPackageVersionToUpdate('v1.2.3')).toBe('1.2.3');
	});

	it('should get version', () => {
		process.env.INPUT_TEST_TAG_PREFIX = 'test/';

		expect(getPackageVersionToUpdate('test/1.2.3')).toBe('1.2.3');
		expect(getPackageVersionToUpdate('test/v1.2.3')).toBe('1.2.3');
	});
});

describe('getReplaceResultMessages', () => {
	it('should return empty', () => {
		expect(getReplaceResultMessages([])).toEqual([]);
	});

	it('should get messages', () => {
		const messages = getReplaceResultMessages([
			{
				file: 'test1',
				hasChanged: true,
			},
			{
				file: 'test2',
				hasChanged: false,
			},
		]);

		expect(messages).toHaveLength(2);
		expect(messages[0]).toContain('test1');
		expect(messages[1]).toContain('test2');
	});
});

describe('getCommitMessage', () => {
	testEnv(rootDir);

	it('should get commit message', () => {
		process.env.INPUT_COMMIT_MESSAGE = 'test message';

		expect(getCommitMessage()).toBe('test message');
	});

	it('should get default commit message', () => {
		expect(getCommitMessage()).toBe('feat: Update package version');
	});
});

describe('getTagName', () => {
	testEnv(rootDir);

	it('should get tag name', () => {
		expect(getTagName(generateContext({
			event: 'push',
			ref: 'tags/test',
		}))).toBe('test');
	});

	it('should get tag name from branch', () => {
		process.env.INPUT_BRANCH_PREFIX = 'release/';
		expect(getTagName(generateContext({
			event: 'push',
			ref: 'heads/release/v1.2.3',
		}))).toBe('v1.2.3');
	});
});
