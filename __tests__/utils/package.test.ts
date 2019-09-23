/* eslint-disable no-magic-numbers */
import nock from 'nock';
import path from 'path';
import { EOL } from 'os';
import { Logger } from '@technote-space/github-action-helper';
import { getContext, testEnv, disableNetConnect, getApiFixture } from '@technote-space/github-action-test-helper';
import { ReplaceResult } from 'replace-in-file';
import { GitHub } from '@actions/github/lib/github';
import global from '../global';
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
});

afterAll(() => {
	jest.restoreAllMocks();
});

beforeEach(() => {
	Logger.resetForTesting();
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

	it('should do nothing', async() => {
		process.env.INPUT_COMMIT_DISABLED = '1';
		const mockStdout = jest.spyOn(global.mockStdout, 'write');

		expect(await commit(new GitHub(''), getContext({
			ref: 'refs/tags/test',
			repo: {
				owner: 'hello',
				repo: 'world',
			},
		}))).toBeTruthy();

		expect(mockStdout).toBeCalledTimes(2);
		expect(mockStdout.mock.calls[0][0]).toBe('##[group]Committing...' + EOL);
		expect(mockStdout.mock.calls[1][0]).toBe('> Commit is disabled.' + EOL);
	});

	it('should return false 1', async() => {
		process.env.INPUT_COMMIT_DISABLED = '';
		const mockStdout = jest.spyOn(global.mockStdout, 'write');

		expect(await commit(new GitHub(''), getContext({
			ref: 'refs/tags/test',
			repo: {
				owner: 'hello',
				repo: 'world',
			},
		}))).toBeFalsy();

		expect(mockStdout).toBeCalledTimes(2);
		expect(mockStdout.mock.calls[0][0]).toBe('##[group]Committing...' + EOL);
		expect(mockStdout.mock.calls[1][0]).toBe('##[warning]Failed to get default branch name.' + EOL);
	});

	it('should return false 2', async() => {
		process.env.INPUT_COMMIT_DISABLED = '0';
		global.mockChildProcess.stdout = 'develop\nfeature/test\n';
		const mockStdout = jest.spyOn(global.mockStdout, 'write');

		expect(await commit(new GitHub(''), getContext({
			ref: 'refs/tags/test',
			repo: {
				owner: 'hello',
				repo: 'world',
			},
			payload: {
				repository: {
					'default_branch': 'master',
				},
			},
		}))).toBeFalsy();

		expect(mockStdout).toBeCalledTimes(5);
		expect(mockStdout.mock.calls[0][0]).toBe('##[group]Committing...' + EOL);
		expect(mockStdout.mock.calls[1][0]).toBe('[command]git branch --contains test | cut -b 3-' + EOL);
		expect(mockStdout.mock.calls[2][0]).toBe('  >> develop' + EOL);
		expect(mockStdout.mock.calls[3][0]).toBe('  >> feature/test' + EOL);
		expect(mockStdout.mock.calls[4][0]).toBe('> This is not default branch.' + EOL);
	});

	it('should call helper commit', async() => {
		process.env.INPUT_COMMIT_DISABLED = 'false';
		global.mockChildProcess.stdout = 'master\nfeature/test\n';
		process.env.INPUT_PACKAGE_DIR = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
		const mockStdout = jest.spyOn(global.mockStdout, 'write');
		const fn = jest.fn();

		nock('https://api.github.com')
			.persist()
			.get('/repos/hello/world/branches/master/protection')
			.reply(200, () => {
				fn();
				return getApiFixture(path.resolve(__dirname, '..', 'fixtures'), 'repos.branches.protection');
			});

		expect(await commit(new GitHub(''), getContext({
			ref: 'refs/tags/test',
			repo: {
				owner: 'hello',
				repo: 'world',
			},
			payload: {
				repository: {
					'default_branch': 'master',
				},
			},
		}))).toBeFalsy();

		expect(fn).toBeCalledTimes(1);
		expect(mockStdout).toBeCalledTimes(5);
		expect(mockStdout.mock.calls[0][0]).toBe('##[group]Committing...' + EOL);
		expect(mockStdout.mock.calls[1][0]).toBe('[command]git branch --contains test | cut -b 3-' + EOL);
		expect(mockStdout.mock.calls[2][0]).toBe('  >> master' + EOL);
		expect(mockStdout.mock.calls[3][0]).toBe('  >> feature/test' + EOL);
		expect(mockStdout.mock.calls[4][0]).toBe('##[warning]Branch [master] is protected.' + EOL);
	});
});
