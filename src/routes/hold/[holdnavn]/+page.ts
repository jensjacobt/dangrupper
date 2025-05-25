import { getEmptyPredefinedGroups } from '$lib/groupGenerator';
import { getStored } from '$lib/persistence.svelte';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

const tableGroupsKey = 'tableGroups';
const tableGroupsHistoryKey = `${tableGroupsKey}-history`;

function predefinedHasInvalidId(predefinedGroups: maybeIdNumber[][], students: Student[]) {
	const studentIds = students.map((s) => s.id);
	return predefinedGroups.flat().some((id) => {
		id != null && !studentIds.includes(id);
	});
}

export const load: PageLoad = async ({ params, parent }) => {
	const { currentClass } = await parent();
	const keyCurrent = `${tableGroupsKey}_${currentClass.id}`;
	const keyHistory = `${tableGroupsHistoryKey}_${currentClass.id}`;
	try {
		console.log('Getting table groups from DB');
		const initialTableGroups: TableGroups = (await getStored<TableGroups>(keyCurrent)) ?? {
			maxRecurring: 0,
			nLastGroups: 4,
			predefinedGroups: [],
			currentGroups: []
		};

		const history: idNumber[][][] = (await getStored<idNumber[][][]>(keyHistory)) ?? [];

		const numStudents = currentClass.students.length;
		const numPredefined = initialTableGroups.predefinedGroups.reduce((s, e) => s + e.length, 0);
		if (
			numPredefined != numStudents ||
			predefinedHasInvalidId(initialTableGroups.predefinedGroups, currentClass.students)
		) {
			console.log('(Re)setting predefined groups');
			initialTableGroups.predefinedGroups = getEmptyPredefinedGroups(numStudents);
		}

		return {
			initialTableGroups,
			history,
			keyCurrent,
			keyHistory
		};
	} catch (err) {
		console.error('Error in preload:', err);
		error(500, 'Fejl under læsning fra databasen');
	}
};
