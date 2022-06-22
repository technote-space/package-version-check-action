import type { Logger } from '@technote-space/github-action-log-helper';
import { Command } from '@technote-space/github-action-helper';

export const getBranchesByTag = async(tagName: string, logger: Logger): Promise<string[]> => (await (new Command(logger)).execAsync({ command: `git branch -a --contains ${tagName} | cut -b 3-` })).stdout
  .trim()
  .split(/\r?\n/)
  .filter(item => item)
  .map(item => item.replace(/^remotes\/origin\//, ''));
