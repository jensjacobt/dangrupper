import { getTableGroups, getTableGroupsHistory } from '$lib/persistence.svelte'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
	const { currentClass } = await parent()
	try {
		console.log('Getting table groups from DB')
		const initialTableGroups: TableGroups = await getTableGroups(currentClass.id)

		const history: HistoryEntry[] = await getTableGroupsHistory(currentClass.id)

		return {
			initialTableGroups,
			history,
		}
	} catch (err) {
		console.error('Error in preload:', err)
		error(500, 'Fejl under læsning fra databasen')
	}
}
