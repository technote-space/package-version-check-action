import { Context } from '@actions/github/lib/context';
import { isValidContext, isValidTagNameContext } from './utils/misc';

export const TARGET_EVENTS = {
	'create': [
		(context: Context): boolean => isValidTagNameContext(context),
	],
	'pull_request': [
		[
			'opened',
			(context: Context): boolean => isValidContext(context),
		],
		[
			'reopened',
			(context: Context): boolean => isValidContext(context),
		],
		[
			'synchronize',
			(context: Context): boolean => isValidContext(context),
		],
	],
	'release': [
		[
			'published',
			(context: Context): boolean => isValidContext(context),
		],
	],
	'push': [
		(context: Context): boolean => isValidContext(context),
	],
};
