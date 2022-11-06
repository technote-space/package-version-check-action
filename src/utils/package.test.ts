/* eslint-disable no-magic-numbers */
import path from 'path';
import { Logger } from '@technote-space/github-action-log-helper';
import {
  getContext,
  testEnv,
  disableNetConnect,
  getApiFixture,
  spyOnStdout,
  stdoutCalledWith,
  spyOnExportVariable,
  exportVariableCalledWith,
  spyOnSetOutput,
  setOutputCalledWith,
  setChildProcessParams,
  testFs,
  getOctokit,
} from '@technote-space/github-action-test-helper';
import nock from 'nock';
import replaceInFile from 'replace-in-file';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  updatePackageVersion,
  getUpdateBranch,
  commit,
} from './package';

const setExists = testFs(true);
const rootDir   = path.resolve(__dirname, '../..');
const logger    = new Logger();
const octokit   = getOctokit();

beforeEach(() => {
  Logger.resetForTesting();
});

describe('updatePackageVersion', () => {
  testEnv(rootDir);

  it('should return false 1', async() => {
    setExists(false);
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    const mockStdout               = spyOnStdout();

    expect(await updatePackageVersion(getContext({
      eventName: 'push',
      ref: 'refs/tags/v0.0.1',
    }), logger)).toBe(false);

    stdoutCalledWith(mockStdout, [
      '::group::Updating package version...',
      '::warning::File [package-test1.json] not found.',
      '::warning::Please checkout before call this GitHub Action.',
    ]);
  });

  it('should return false 2', async() => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    const mockStdout               = spyOnStdout();

    expect(await updatePackageVersion(getContext({
      eventName: 'push',
      ref: 'refs/tags/v0.0.1',
    }), logger)).toBe(false);

    stdoutCalledWith(mockStdout, [
      '::group::Updating package version...',
      '> target version: v0.0.1',
      '> current version: 0.0.1',
      '> No need to update.',
    ]);
  });

  it('should return false 3', async() => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    process.env.INPUT_NEXT_VERSION = 'v0.0.1';
    const mockStdout               = spyOnStdout();

    expect(await updatePackageVersion(getContext({
      eventName: 'push',
    }), logger)).toBe(false);

    stdoutCalledWith(mockStdout, [
      '::group::Updating package version...',
      '> target version: v0.0.1',
      '> current version: 0.0.1',
      '> No need to update.',
    ]);
  });

  it('should return true 1', async() => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    const mockStdout               = spyOnStdout();

    const fn                = vi.fn(() => ([
      { file: 'test1', hasChanged: true },
      { file: 'test2', hasChanged: false },
    ]));
    const replaceInFileMock = vi.spyOn(replaceInFile, 'replaceInFile').mockImplementation(fn);

    expect(await updatePackageVersion(getContext({
      eventName: 'push',
      ref: 'refs/tags/v0.0.2',
    }), logger)).toBe(true);

    stdoutCalledWith(mockStdout, [
      '::group::Updating package version...',
      '> target version: v0.0.2',
      '> current version: 0.0.1',
      '  >> \x1b[32;40m✔\x1b[0m test1',
      '  >> \x1b[31;40m✖\x1b[0m test2',
    ]);

    expect(replaceInFileMock).toBeCalledTimes(1);
    expect(replaceInFileMock).toBeCalledWith({
      files: path.resolve(__dirname, '..', 'fixtures', 'package-test1.json'),
      from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
      to: '"version": "$10.0.2"$2',
    });
  });

  it('should return true 2', async() => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    process.env.INPUT_NEXT_VERSION = 'v0.0.3';
    const mockStdout               = spyOnStdout();

    const fn                = vi.fn(() => ([]));
    const replaceInFileMock = vi.spyOn(replaceInFile, 'replaceInFile').mockImplementation(fn);

    expect(await updatePackageVersion(getContext({
      eventName: 'push',
      ref: 'refs/tags/v0.0.2',
    }), logger)).toBe(true);

    stdoutCalledWith(mockStdout, [
      '::group::Updating package version...',
      '> target version: v0.0.3',
      '> current version: 0.0.1',
    ]);

    expect(replaceInFileMock).toBeCalledTimes(1);
    expect(replaceInFileMock).toBeCalledWith({
      files: path.resolve(__dirname, '..', 'fixtures', 'package-test1.json'),
      from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
      to: '"version": "$10.0.3"$2',
    });
  });

  it('should return true 3', async() => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    process.env.INPUT_NEXT_VERSION = '1.0.0-rc.1';
    const mockStdout               = spyOnStdout();

    const fn                = vi.fn(() => ([]));
    const replaceInFileMock = vi.spyOn(replaceInFile, 'replaceInFile').mockImplementation(fn);

    expect(await updatePackageVersion(getContext({
      eventName: 'push',
      ref: 'refs/tags/v0.0.2',
    }), logger)).toBe(true);

    stdoutCalledWith(mockStdout, [
      '::group::Updating package version...',
      '> target version: 1.0.0-rc.1',
      '> current version: 0.0.1',
    ]);

    expect(replaceInFileMock).toBeCalledTimes(1);
    expect(replaceInFileMock).toBeCalledWith({
      files: path.resolve(__dirname, '..', 'fixtures', 'package-test1.json'),
      from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
      to: '"version": "$11.0.0-rc.1"$2',
    });
  });

  it('should return true 4', async() => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    process.env.INPUT_NEXT_VERSION = 'v3.0.0+f2eed76';
    const mockStdout               = spyOnStdout();

    const fn                = vi.fn(() => ([]));
    const replaceInFileMock = vi.spyOn(replaceInFile, 'replaceInFile').mockImplementation(fn);

    expect(await updatePackageVersion(getContext({
      eventName: 'push',
      ref: 'refs/tags/v0.0.2',
    }), logger)).toBe(true);

    stdoutCalledWith(mockStdout, [
      '::group::Updating package version...',
      '> target version: v3.0.0+f2eed76',
      '> current version: 0.0.1',
    ]);

    expect(replaceInFileMock).toBeCalledTimes(1);
    expect(replaceInFileMock).toBeCalledWith({
      files: path.resolve(__dirname, '..', 'fixtures', 'package-test1.json'),
      from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
      to: '"version": "$13.0.0+f2eed76"$2',
    });
  });

  it('should return true 5', async() => {
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    process.env.INPUT_NEXT_VERSION = 'v1.0-beta+exp.sha.5114f85';
    const mockStdout               = spyOnStdout();

    const fn                = vi.fn(() => ([]));
    const replaceInFileMock = vi.spyOn(replaceInFile, 'replaceInFile').mockImplementation(fn);

    expect(await updatePackageVersion(getContext({
      eventName: 'push',
      ref: 'refs/tags/v0.0.2',
    }), logger)).toBe(true);

    stdoutCalledWith(mockStdout, [
      '::group::Updating package version...',
      '> target version: v1.0-beta+exp.sha.5114f85',
      '> current version: 0.0.1',
    ]);

    expect(replaceInFileMock).toBeCalledTimes(1);
    expect(replaceInFileMock).toBeCalledWith({
      files: path.resolve(__dirname, '..', 'fixtures', 'package-test1.json'),
      from: /"version"\s*:\s*"(v?).+?"\s*(,?)$/gm,
      to: '"version": "$11.0.0-beta+exp.sha.5114f85"$2',
    });
  });
});

describe('getUpdateBranch', () => {
  testEnv(rootDir);
  const logger = new Logger();

  it('should return false 1', async() => {
    expect(await getUpdateBranch(logger, getContext({
      eventName: 'push',
      ref: 'refs/tags/test',
    }))).toBe(false);
  });

  it('should return false 2', async() => {
    setChildProcessParams({ stdout: '' });

    expect(await getUpdateBranch(logger, getContext({
      eventName: 'push',
      ref: 'refs/tags/test',
      payload: {
        repository: {
          'default_branch': 'master',
        },
      },
    }))).toBe(false);
  });

  it('should get default branch', async() => {
    setChildProcessParams({ stdout: 'remotes/origin/master' });

    expect(await getUpdateBranch(logger, getContext({
      eventName: 'push',
      ref: 'refs/tags/test',
      payload: {
        repository: {
          'default_branch': 'master',
        },
      },
    }))).toBe('master');
  });

  it('should get branch 1', async() => {
    expect(await getUpdateBranch(logger, getContext({
      eventName: 'push',
      ref: 'refs/heads/release/v1.2.3',
    }))).toBe('release/v1.2.3');
  });

  it('should get branch 2', async() => {
    process.env.INPUT_BRANCH_PREFIX = 'release/';
    setChildProcessParams({ stdout: '' });

    expect(await getUpdateBranch(logger, getContext({
      eventName: 'pull_request',
      ref: 'refs/pull/123/merge',
      payload: {
        repository: {
          'default_branch': 'master',
        },
        'pull_request': {
          head: {
            ref: 'feature/new-feature',
          },
        },
      },
    }))).toBe('feature/new-feature');
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
    }), logger)).toBe(true);

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
    }), logger)).toBe(false);

    stdoutCalledWith(mockStdout, [
      '::group::Committing...',
      '::warning::Failed to get default branch name.',
    ]);
  });

  it('should return false 2', async() => {
    process.env.INPUT_COMMIT_DISABLED = '0';
    setChildProcessParams({ stdout: 'develop\nfeature/test\n' });
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
    }), logger)).toBe(false);

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
    setChildProcessParams({ stdout: 'master\nfeature/test\n' });
    process.env.INPUT_PACKAGE_DIR  = 'src/fixtures';
    process.env.INPUT_PACKAGE_NAME = 'package-test1.json';
    const mockStdout               = spyOnStdout();
    const mockEnv                  = spyOnExportVariable();
    const mockOutput               = spyOnSetOutput();

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
      .patch(`/repos/hello/world/git/refs/${encodeURIComponent('heads/master')}`)
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
    }), logger)).toBe(true);

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
      '::group::Updating ref... [heads/master] [7638417db6d59f3c431d3e1f261cc637155684cd]',
      '::endgroup::',
    ]);
    exportVariableCalledWith(mockEnv, [
      { name: 'GITHUB_SHA', val: '7638417db6d59f3c431d3e1f261cc637155684cd' },
    ]);
    setOutputCalledWith(mockOutput, [{ name: 'sha', value: '7638417db6d59f3c431d3e1f261cc637155684cd' }]);
  });
});
