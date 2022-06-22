import { Logger } from '@technote-space/github-action-log-helper';
import { setChildProcessParams } from '@technote-space/github-action-test-helper';
import { describe, expect, it } from 'vitest';
import { getBranchesByTag } from './command';

const logger = new Logger();

describe('getBranchesByTag', () => {
  it('should empty', async() => {
    setChildProcessParams({ stdout: '' });
    expect(await getBranchesByTag('', logger)).toEqual([]);
  });

  it('should get branches', async() => {
    setChildProcessParams({ stdout: 'develop\nfeature/test\nremotes/origin/master\n' });
    expect(await getBranchesByTag('', logger)).toEqual([
      'develop',
      'feature/test',
      'master',
    ]);
  });
});
