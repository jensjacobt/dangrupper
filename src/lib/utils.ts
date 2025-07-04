export function urlNameToClassName(urlName: string): string {
	return urlName.replaceAll('_', ' ');
}

export function classNameUrlName(urlName: string): string {
	return urlName.replaceAll(' ', '_');
}

export function getNextStudentId(students: Student[]) {
	let id = -1;
	for (const s of students) {
		if (s.id > id) {
			id = s.id
		}
	}
	return id + 1
}
