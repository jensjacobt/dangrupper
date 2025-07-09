export function urlNameToClassName(urlName: string): string {
	return urlName.replaceAll('_', ' ');
}

export function classNameUrlName(urlName: string): string {
	return urlName.replaceAll(' ', '_');
}

export function getNextStudentId(students: Student[]) {
	let id = 0;
	for (const s of students) {
		if (s.id > id) {
			id = s.id
		}
	}
	return id + 1
}

export function groupsFromIds(ids: maybeIdNumber[][], klass: Class): Student[][] {
	const groups = [];
	for (const groupIds of ids) {
		const group: Student[] = [];
		for (const id of groupIds) {
			const student = klass.students.find((s) => s.id == id);
			if (student) {
				group.push(student);
			}
		}
		groups.push(group);
	}
	return groups;
}
