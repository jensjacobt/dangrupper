import type { ActionReturn } from 'svelte/action'

let bluredWhileInvalid = $state(false)

export function validateClassName(value: string) {
	if (value == '') return 'Holdnavn skal udfyldes'
	if (value.trim() == '') return 'Holdnavn skal indeholde mere end mellemrum'
	// Her begrænses holdnavn til at se pænt ud i adresselinjen (herunder forbydes "_")
	if (!/^[0-9a-zA-Z\sæøåÆØÅ-]+$/.test(value))
		return 'Holdnavn må kun indeholde karaktererne a-å, A-Å, 0-9 samt bindestreg (-) og mellemrum ( )'
	return ''
}

export function validateStudents(students: Student[]): string {
	if (students.length == 0 || students.every((s) => s.name.trim() === '')) {
		return 'Tilføj mindst én elev til listen'
	}

	const studentNames = students.map((s) => s.name)
	const duplicates = studentNames
		.filter((item, index) => studentNames.indexOf(item) !== index)
		.filter((n) => n.trim() !== '')

	if (duplicates.length && duplicates.some((name) => name !== '')) {
		return `Gengangere på listen: ${duplicates.join(', ')}`
	}
	return ''
}

export function validity(input: HTMLInputElement, validator: (s: string) => string): ActionReturn {
	function validateOnBlur() {
		const validityMessage = validator(input.value) ?? ''
		input.setCustomValidity(validityMessage)
		if (!bluredWhileInvalid && validityMessage !== '') {
			input.reportValidity()
			bluredWhileInvalid = true
		}
	}

	function validateOnInput() {
		if (!bluredWhileInvalid) return

		const validityMessage = validator(input.value) ?? ''
		input.setCustomValidity(validityMessage)
		bluredWhileInvalid = validityMessage !== ''
	}

	input.addEventListener('blur', validateOnBlur)
	input.addEventListener('input', validateOnInput)

	return {
		destroy() {
			input.removeEventListener('blur', validateOnBlur)
			input.removeEventListener('input', validateOnInput)
		},
	}
}
