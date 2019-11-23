import { Logger, Command } from '@technote-space/github-action-helper';

const command = new Command(new Logger());
const {execAsync} = command;

export const getBranchesByTag = async(tagName: string): Promise<string[]> => {
	return (await execAsync({command: `git branch -a --contains ${tagName} | cut -b 3-`})).stdout
		.trim()
		.split(/\r?\n/)
		.filter(item => item)
		.map(item => item.replace(/^remotes\/origin\//, ''));
};
