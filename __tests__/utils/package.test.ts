/* eslint-disable no-magic-numbers */
import nock from 'nock';
import path from 'path';
import { getContext } from '@technote-space/github-action-test-helper';
import { testEnv, disableNetConnect, getApiFixture } from '@technote-space/github-action-test-helper';
import { ReplaceResult } from 'replace-in-file';
import { GitHub } from '@actions/github/lib/github';
import { updatePackageVersion, commit } from '../../src/utils/package';

jest.mock('replace-in-file', () => jest.fn((): ReplaceResult[] => ([
	{file: 'test1', hasChanged: true},
	{file: 'test2', hasChanged: false},
])));

let exists = true;
beforeAll(() => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const fs = require('fs');
	jest.spyOn(fs, 'existsSync').mockImplementation(() => exists);

	jest.spyOn(process.stdout, 'write').mockImplementation(jest.fn());
});

afterAll(() => {
	jest.restoreAllMocks();
});

describe('updatePackageVersion', () => {
	testEnv();

	it('should return false 1', async() => {
		exists = false;
		process.env.INPUT_PACKAGE_DIR = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';

		expect(await updatePackageVersion(getContext({
			eventName: 'push',
			ref: 'refs/tags/v0.0.1',
		}))).toBeFalsy();
		exists = true;
	});

	it('should return false 2', async() => {
		process.env.INPUT_PACKAGE_DIR = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';

		expect(await updatePackageVersion(getContext({
			eventName: 'push',
			ref: 'refs/tags/v0.0.1',
		}))).toBeFalsy();
	});

	it('should return true', async() => {
		process.env.INPUT_PACKAGE_DIR = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';

		expect(await updatePackageVersion(getContext({
			eventName: 'push',
			ref: 'refs/tags/v0.0.2',
		}))).toBeTruthy();
	});
});

describe('commit', () => {
	testEnv();
	disableNetConnect(nock);

	it('should call helper commit', async() => {
		process.env.INPUT_PACKAGE_DIR = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/branches/test/protection')
			.reply(200, () => getApiFixture(path.resolve(__dirname, '..', 'fixtures'), 'repos.branches.protection'));

		expect(await commit(new GitHub(''), getContext({
			ref: 'refs/heads/test',
			repo: {
				owner: 'hello',
				repo: 'world',
			},
		}))).toBeFalsy();
	});
});
