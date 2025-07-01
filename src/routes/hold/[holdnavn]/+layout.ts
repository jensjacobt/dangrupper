import { urlNameToClassName } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, parent }) => {
	const className = urlNameToClassName(params.holdnavn);
	console.log(`-----------------------------------------------\nLoading data for class ${className}`);

	const { classes } = await parent();
	const currentClass = classes.find((c) => c.name == className);
	if (!currentClass) {
		console.error(`"${className}" blev ikke fundet blandt holdnavne`);
		error(404, 'Holdet blev ikke fundet');
	} 
		
	return { currentClass };
};
