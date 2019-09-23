/* eslint-disable no-magic-numbers */
import global from './__tests__/global';

global.mockStdout = {
	write: jest.fn(),
};
process.stdout.write = global.mockStdout.write;

global.mockChildProcess = {
	stdout: 'stdout',
	stderr: '',
	error: null,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	exec: jest.fn((...args: any[]) => {
		const callback = args.length === 2 ? args[1] : args[2];
		callback(global.mockChildProcess.error, global.mockChildProcess.stdout, global.mockChildProcess.stderr);
	}),
};
jest.mock('child_process', () => ({
	...jest.requireActual('child_process'),
	exec: global.mockChildProcess.exec,
}));

process.env.GITHUB_ACTOR = 'octocat';
