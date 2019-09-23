import global from '../global';
import { getBranchesByTag } from '../../src/utils/command';

describe('getBranchesByTag', () => {
	it('should empty', async() => {
		global.mockChildProcess.stdout = '';
		expect(await getBranchesByTag('')).toEqual([]);
	});

	it('should get branches', async() => {
		global.mockChildProcess.stdout = 'develop\nfeature/test\nremotes/origin/master\n';
		expect(await getBranchesByTag('')).toEqual([
			'develop',
			'feature/test',
			'master',
		]);
	});
});
