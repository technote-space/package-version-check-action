import { Logger, Command } from '@technote-space/github-action-helper';

const command = new Command(new Logger());
const {execAsync} = command;

export const getBranchesByTag = async(tagName: string): Promise<string[]> => {
	return (await execAsync({command: `git branch --contains ${tagName} | cut -b 3-`})).trim().replace(/\r?\n$/, '').split(/\r?\n/);
};
