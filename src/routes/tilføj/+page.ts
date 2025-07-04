import { getClassBeingAdded } from '$lib/persistence.svelte';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	try {
		console.log('Getting class being added from DB');
		return {
			classBeingAdded: await getClassBeingAdded()	
		};
	} catch (err) {
		console.error('Error in preload:', err);
		error(500, 'Fejl under læsning fra databasen');
	}
};


