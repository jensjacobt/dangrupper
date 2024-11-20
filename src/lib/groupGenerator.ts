function getMaxSize() {
	return 4;
}

/**
 * n: number of students in class
 */
function getGroupSizes(n: number): number[] {
	const g = getMaxSize();
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

export function getEmptyPredefinedGroups(numStudents: number): maybeIdNumber[][] {
	return getGroupSizes(numStudents).map((gs) => Array(gs).fill(null));
}

export function createTableGroups(predefinedGroups: maybeIdNumber[][]) {
	return [];
}
