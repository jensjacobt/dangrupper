import { getManualGroups } from '$lib/persistence.svelte'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
	const { currentClass } = await parent()
	try {
		console.log('Getting manual groups from DB')
		const initialManualGroups = await getManualGroups(currentClass.id)

		return {
			initialManualGroups,
		}
	} catch (err) {
		console.error('Error in preload:', err)
		error(500, 'Fejl under læsning fra databasen')
	}
}
