import { getRandomGroups } from '$lib/persistence.svelte'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
	const { currentClass } = await parent()
	try {
		console.log('Getting random groups from DB')
		const initialRandomGroups = await getRandomGroups(currentClass.id)

		return {
			initialRandomGroups,
		}
	} catch (err) {
		console.error('Error in preload:', err)
		error(500, 'Fejl under læsning fra databasen')
	}
}
