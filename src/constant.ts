import { Context } from '@actions/github/lib/context';
import { isValidContext } from './utils/misc';

export const DEFAULT_COMMIT_MESSAGE = 'feat: Update package version';
export const DEFAULT_PACKAGE_NAME = 'package.json';
export const DEFAULT_TEST_TAG_PREFIX = '';
export const TARGET_EVENTS = {
	'release': [
		[
			'published',
			(context: Context): boolean => isValidContext(context),
		],
		[
			'rerequested',
			(context: Context): boolean => isValidContext(context),
		],
	],
	'push': [
		(context: Context): boolean => isValidContext(context),
	],
};
