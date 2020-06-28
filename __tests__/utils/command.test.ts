import {setChildProcessParams} from '@technote-space/github-action-test-helper';
import {getBranchesByTag} from '../../src/utils/command';

describe('getBranchesByTag', () => {
  it('should empty', async() => {
    setChildProcessParams({stdout: ''});
    expect(await getBranchesByTag('')).toEqual([]);
  });

  it('should get branches', async() => {
    setChildProcessParams({stdout: 'develop\nfeature/test\nremotes/origin/master\n'});
    expect(await getBranchesByTag('')).toEqual([
      'develop',
      'feature/test',
      'master',
    ]);
  });
});
