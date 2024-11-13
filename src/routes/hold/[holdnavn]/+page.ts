import { IdbStore } from '$lib/persistence.svelte';
import { urlNameToClassName } from '$lib/utils';
import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const className = urlNameToClassName(params.holdnavn);
	// Få holdnavn fra "parent":
	// https://svelte.dev/docs/kit/load#Using-parent-data

	if (!['1x Fy', '1z Ma'].includes(className)) {
		console.error(`"${params.holdnavn}" blev ikke fundet blandt holdnavne`);
		redirect(301, '/');
	}

	try {
		const hold = await IdbStore.create('hold_1x Fy_bordgrupper', null);
		return hold;
	} catch (error) {
		console.error('Fejl i preload', error);
		return { message: 'FEJl!' };
	}
};
