import { getEmptyPredefinedGroups, getTableGroupSizes } from '$lib/groupGenerator'
import { getTableGroups, getTableGroupsHistory } from '$lib/persistence.svelte'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
	const { currentClass } = await parent()
	try {
		console.log('Getting table groups from DB')
		const initialTableGroups: TableGroups = await getTableGroups(currentClass.id)

		const history: HistoryEntry[] = await getTableGroupsHistory(currentClass.id)

		const numStudents = currentClass.students.length
		const numPredefined = initialTableGroups.predefinedGroups.reduce((s, e) => s + e.length, 0)
		if (
			numPredefined != numStudents
			|| predefinedHasInvalidId(initialTableGroups.predefinedGroups, currentClass.students)
		) {
			console.log('(Re)setting predefined groups')
			initialTableGroups.predefinedGroups = getEmptyPredefinedGroups(numStudents)
		}

		const numManual = initialTableGroups.manualGroupSizes.reduce((s, e) => s + e, 0)
		if (numManual != numStudents) {
			console.log('(Re)setting manual group sizes')
			initialTableGroups.manualGroupSizes = getTableGroupSizes(numStudents)
		}

		return {
			initialTableGroups,
			history,
		}
	} catch (err) {
		console.error('Error in preload:', err)
		error(500, 'Fejl under læsning fra databasen')
	}
}

function predefinedHasInvalidId(predefinedGroups: maybeIdNumber[][], students: Student[]) {
	const studentIds = students.map((s) => s.id)
	return predefinedGroups.flat().some((id) => id != null && !studentIds.includes(id))
}
