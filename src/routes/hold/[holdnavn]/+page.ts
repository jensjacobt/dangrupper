import { getEmptyPredefinedGroups } from '$lib/groupGenerator';
import { getStored } from '$lib/persistence.svelte';
import type StudentRow from '$lib/StudentRow.svelte';
import { urlNameToClassName } from '$lib/utils';
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

const tableGroupsKey = 'tableGroups';

function predefinedGroupsHaveInvalidId(predefinedGroups: maybeIdNumber[][], students: Student[]) {
	const studentIds = students.map((s) => s.id);
	return predefinedGroups.flat().some((id) => {
		id != null && !studentIds.includes(id);
	});
}

export const load: PageLoad = async ({ params, parent }) => {
	const className = urlNameToClassName(params.holdnavn);
	console.log(
		`-----------------------------------------------\nLoading data for class ${className}`
	);
	const { classes } = await parent();

	const currentClass = classes.find((c) => c.name == className);

	if (!currentClass) {
		console.error(`"${className}" blev ikke fundet blandt holdnavne`);
		error(404, 'Holdet blev ikke fundet');
	} else {
		const key = `${tableGroupsKey}_${currentClass.id}`;
		try {
			console.log('Getting table groups from DB');
			const initialTableGroups: TableGroups = (await getStored<TableGroups>(key)) || {
				maxRecurring: 0,
				nLastGroups: 4,
				predefinedGroups: [],
				currentGroups: []
			};

			const numStudents = currentClass.students.length;
			const firstSum = initialTableGroups.predefinedGroups.reduce((s, e) => s + e.length, 0);
			if (
				firstSum != numStudents ||
				predefinedGroupsHaveInvalidId(initialTableGroups.predefinedGroups, currentClass.students)
			) {
				// TODO: ... eller en elev fra predefinedGroups ikke er med i students <-- Ville det give problemer?
				console.log('(Re)setting predefined groups');
				initialTableGroups.predefinedGroups = getEmptyPredefinedGroups(numStudents);
			}

			return {
				currentClass,
				initialTableGroups,
				key
			};
		} catch (err) {
			console.error('Error in preload:', err);
			error(500, 'Fejl under læsning fra databasen');
		}
	}
};
