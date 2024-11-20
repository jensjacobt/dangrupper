export function validateClassName(value: string) {
	if (value == '') return 'Holdnavn skal udfyldes';
	if (value.trim() == '') return 'Holdnavn skal indeholde mere end mellemrum';
	// Her begrænses holdnavn til at se pænt ud i adresselinjen (herunder forbydes "_")
	if (!/^[0-9a-zA-Z\sæøåÆØÅ-]+$/.test(value))
		return 'Holdnavn må kun indeholde karaktererne a-å, A-Å, 0-9 samt bindestreg (-) og mellemrum ( )';
	return '';
}

export function validateStudents(students: Student[]): string {
	if (students.length == 0) return 'Tilføj mindst én elev til listen';

	const studentNames = students.map((s) => s.name);
	const duplicates = studentNames.filter((item, index) => studentNames.indexOf(item) !== index);
	if (duplicates.length) {
		return `Gengangere på listen: ${duplicates.join(', ')}`;
	}
	return '';
}
