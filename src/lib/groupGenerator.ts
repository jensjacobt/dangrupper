export function getEmptyPredefinedGroups(numStudents: number): maybeIdNumber[][] {
	return getGroupSizes(numStudents).map((gs) => Array(gs).fill(null));
}

export function createTableGroups(
	students: Student[],
	history: idNumber[][][],
	tableGroups: TableGroups
): [groups: idNumber[][], warning: string] {
	return [getRandomGroups(students), ''];
}

function getRandomGroups(students: Student[]): idNumber[][] {
	const shuffled = students.map((s) => s.id);
	shuffleArray(shuffled);
	const sizes = getGroupSizes(students.length);
	const groups = [];
	let i = 0;
	for (const size of sizes) {
		groups.push(shuffled.slice(i, i + size));
		i += size;
	}
	return groups;
}

function shuffleArray(array: any[]) {
	for (let i = array.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

/**
 * n: number of students in class
 * g: max number of students per group
 */
function getGroupSizes(n: number, g: number = 4): number[] {
	if (n <= g) return [n];
	if (n % g == 0) return Array(n / g).fill(g);
	if (n % g == 1) {
		const a = Array(Math.floor(n / g) + 1).fill(g, 0, -2);
		a[a.length - 2] = g - 1;
		a[a.length - 1] = 2;
		return a;
	}
	const a = Array(Math.floor(n / g) + 1).fill(g);
	a[a.length - 1] = n % g;
	return a;
}
