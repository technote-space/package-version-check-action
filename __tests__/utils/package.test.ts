/* eslint-disable no-magic-numbers */
import nock from 'nock';
import path from 'path';
import { Logger } from '@technote-space/github-action-helper';
import {
	getContext,
	testEnv,
	disableNetConnect,
	getApiFixture,
	spyOnStdout,
	stdoutCalledWith,
	setChildProcessParams,
	testFs,
} from '@technote-space/github-action-test-helper';
import { ReplaceResult } from 'replace-in-file';
import { GitHub } from '@actions/github/lib/github';
import {
	updatePackageVersion,
	getBranch,
	commit,
} from '../../src/utils/package';

jest.mock('replace-in-file', () => jest.fn((): ReplaceResult[] => ([
	{file: 'test1', hasChanged: true},
	{file: 'test2', hasChanged: false},
])));

const setExists = testFs(true);
const octokit   = new GitHub('test-token');
const rootDir   = path.resolve(__dirname, '../..');

beforeEach(() => {
	Logger.resetForTesting();
});

describe('updatePackageVersion', () => {
	testEnv(rootDir);

	it('should return false 1', async() => {
		setExists(false);
		process.env.INPUT_PACKAGE_DIR  = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';

		expect(await updatePackageVersion(getContext({
			eventName: 'push',
			ref: 'refs/tags/v0.0.1',
		}))).toBeFalsy();
	});

	it('should return false 2', async() => {
		process.env.INPUT_PACKAGE_DIR  = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';

		expect(await updatePackageVersion(getContext({
			eventName: 'push',
			ref: 'refs/tags/v0.0.1',
		}))).toBeFalsy();
	});

	it('should return true', async() => {
		process.env.INPUT_PACKAGE_DIR  = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';

		expect(await updatePackageVersion(getContext({
			eventName: 'push',
			ref: 'refs/tags/v0.0.2',
		}))).toBeTruthy();
	});
});

describe('getBranch', () => {
	const logger = new Logger();

	it('should return false 1', async() => {
		expect(await getBranch(logger, getContext({
			eventName: 'push',
			ref: 'refs/tags/test',
		}))).toBeFalsy();
	});

	it('should return false 2', async() => {
		setChildProcessParams({stdout: ''});

		expect(await getBranch(logger, getContext({
			eventName: 'push',
			ref: 'refs/tags/test',
			payload: {
				repository: {
					'default_branch': 'master',
				},
			},
		}))).toBeFalsy();
	});

	it('should get default branch', async() => {
		setChildProcessParams({stdout: 'remotes/origin/master'});

		expect(await getBranch(logger, getContext({
			eventName: 'push',
			ref: 'refs/tags/test',
			payload: {
				repository: {
					'default_branch': 'master',
				},
			},
		}))).toBe('master');
	});

	it('should get branch', async() => {
		expect(await getBranch(logger, getContext({
			eventName: 'push',
			ref: 'refs/heads/release/v1.2.3',
		}))).toBe('release/v1.2.3');
	});
});

describe('commit', () => {
	testEnv(rootDir);
	disableNetConnect(nock);

	it('should do nothing', async() => {
		process.env.INPUT_COMMIT_DISABLED = '1';
		const mockStdout                  = spyOnStdout();

		expect(await commit(octokit, getContext({
			ref: 'refs/tags/test',
			repo: {
				owner: 'hello',
				repo: 'world',
			},
		}))).toBeTruthy();

		stdoutCalledWith(mockStdout, [
			'::group::Committing...',
			'> Commit is disabled.',
		]);
	});

	it('should return false 1', async() => {
		process.env.INPUT_COMMIT_DISABLED = '';
		const mockStdout                  = spyOnStdout();

		expect(await commit(octokit, getContext({
			ref: 'refs/tags/test',
			repo: {
				owner: 'hello',
				repo: 'world',
			},
		}))).toBeFalsy();

		stdoutCalledWith(mockStdout, [
			'::group::Committing...',
			'::warning::Failed to get default branch name.',
		]);
	});

	it('should return false 2', async() => {
		process.env.INPUT_COMMIT_DISABLED = '0';
		setChildProcessParams({stdout: 'develop\nfeature/test\n'});
		const mockStdout = spyOnStdout();

		expect(await commit(octokit, getContext({
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

		stdoutCalledWith(mockStdout, [
			'::group::Committing...',
			'[command]git branch -a --contains test | cut -b 3-',
			'  >> develop',
			'  >> feature/test',
			'> This is not default branch.',
		]);
	});

	it('should call helper commit', async() => {
		process.env.INPUT_COMMIT_DISABLED = 'false';
		setChildProcessParams({stdout: 'master\nfeature/test\n'});
		process.env.INPUT_PACKAGE_DIR  = '__tests__/fixtures';
		process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
		const mockStdout               = spyOnStdout();

		nock('https://api.github.com')
			.persist()
			.post('/repos/hello/world/git/blobs')
			.reply(201, () => {
				return getApiFixture(path.resolve(__dirname, '..', 'fixtures'), 'repos.git.blobs');
			})
			.get('/repos/hello/world/git/commits/7638417db6d59f3c431d3e1f261cc637155684cd')
			.reply(200, () => getApiFixture(path.resolve(__dirname, '..', 'fixtures'), 'repos.git.commits.get'))
			.post('/repos/hello/world/git/trees')
			.reply(201, () => getApiFixture(path.resolve(__dirname, '..', 'fixtures'), 'repos.git.trees'))
			.post('/repos/hello/world/git/commits')
			.reply(201, () => getApiFixture(path.resolve(__dirname, '..', 'fixtures'), 'repos.git.commits'))
			.patch('/repos/hello/world/git/refs/' + encodeURIComponent('heads/master'))
			.reply(200, () => getApiFixture(path.resolve(__dirname, '..', 'fixtures'), 'repos.git.refs'));

		expect(await commit(octokit, getContext({
			ref: 'refs/tags/test',
			repo: {
				owner: 'hello',
				repo: 'world',
			},
			sha: '7638417db6d59f3c431d3e1f261cc637155684cd',
			payload: {
				repository: {
					'default_branch': 'master',
				},
			},
		}))).toBeTruthy();

		stdoutCalledWith(mockStdout, [
			'::group::Committing...',
			'[command]git branch -a --contains test | cut -b 3-',
			'  >> master',
			'  >> feature/test',
			'::endgroup::',
			'::group::Creating blobs...',
			'::endgroup::',
			'::group::Creating tree...',
			'::endgroup::',
			'::group::Creating commit... [cd8274d15fa3ae2ab983129fb037999f264ba9a7]',
			'::endgroup::',
			'::group::Updating ref... [heads%252Fmaster] [7638417db6d59f3c431d3e1f261cc637155684cd]',
			'::set-env name=GITHUB_SHA::7638417db6d59f3c431d3e1f261cc637155684cd',
			'::endgroup::',
		]);
	});
});
