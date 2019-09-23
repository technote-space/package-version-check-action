import { ExecException } from 'child_process';

interface Global extends NodeJS.Global {
	mockStdout: {
		write: jest.Mock;
	};
	mockChildProcess: {
		exec: jest.Mock;
		stdout: string;
		stderr: string;
		error: ExecException | null;
	};
}

declare const global: Global;
export default global;
