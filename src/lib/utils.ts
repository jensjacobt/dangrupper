export function urlNameToClassName(urlName: string): string {
	return decodeURI(urlName).replaceAll('_', ' ')
}

export function classNameToUrlName(className: string): string {
	return encodeURI(className.replaceAll(' ', '_'))
}

export function getNextStudentId(students: Student[]) {
	let id = 0
	for (const s of students) {
		if (s.id > id) {
			id = s.id
		}
	}
	return id + 1
}

export function studentsFromIds(studentIds: maybeIdNumber[], klass: Class) {
	const group: Student[] = []
	for (const id of studentIds) {
		const student = klass.students.find((s) => s.id == id)
		if (student) {
			group.push(student)
		}
	}
	return group
}

export function groupsFromIds(ids: maybeIdNumber[][], klass: Class) {
	const groups = []
	for (const groupIds of ids) {
		groups.push(studentsFromIds(groupIds, klass))
	}
	return groups
}
