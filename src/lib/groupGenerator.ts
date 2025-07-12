/* Table Groups */
export function getEmptyPredefinedGroups(numStudents: number): maybeIdNumber[][] {
	return getTableGroupSizes(numStudents).map((gs) => Array(gs).fill(null))
}

const random = (function () {
	if (!crypto) return Math.random

	const max = Math.pow(2, 32)
	const u32 = new Uint32Array(1)

	return function random() {
		return crypto.getRandomValues(u32)[0] / max
	}
})()

type TableOfPartners = Map<idNumber, Set<idNumber>>

export function createTableGroups(
	students: Student[],
	history: HistoryEntry[],
	tableGroups: TableGroups,
): [groups: idNumber[][], overMaxPredefined: maybeIdNumber[][]] {
	const studentIds = students.map((s) => s.id)
	const maxReps = 1 + tableGroups.maxRecurring
	const overMaxPredefined: maybeIdNumber[][] = []
	const tableOfPartners = getTableOfPreviousPartners(studentIds, history, tableGroups.nLastGroups)
	const predefinedGroups = tableGroups.predefinedGroups.toReversed()

	let preassigned = new Set<idNumber>()
	const nonNull = (s: maybeIdNumber) => s !== null
	for (const pg of predefinedGroups) {
		const ss = new Set(pg.filter(nonNull))
		if (ss.size > 0) {
			for (const s of ss) {
				if (!studentIds.includes(s)) {
					throw Error(`Den indtastede person med id "${s}" kunne ikke findes på listen over elever`)
				}
			}
			if (tooManyReps(tableOfPartners, ss, maxReps)) {
				overMaxPredefined.push(pg)
				for (const s of ss) {
					tableOfPartners.set(s, (tableOfPartners.get(s) as Set<idNumber>).difference(ss))
				}
			}
		}
		preassigned = preassigned.union(ss)
	}
	const assignableStudents = studentIds.filter((s) => !preassigned.has(s))

	if (assignableStudents.length + predefinedGroups.flat().filter((s) => s !== null).length !== students.length) {
		throw Error('Antal elever der skulle placeres stemmer ikke med antal forudbestemte medlemmer.')
	}

	for (let j = 0; j < 250; j++) {
		let rest = assignableStudents.slice(0)
		const predefined = predefinedGroups.slice(0)

		const groups: idNumber[][] = []
		for (let i = 0; i < 100; i++) {
			if (predefined.length == 0) break

			const pred = predefined[predefined.length - 1]
			const group = groupFromPredefined(pred, rest)
			if (!tooManyReps(tableOfPartners, new Set(group), maxReps)) {
				rest = rest.filter((s) => !group.includes(s))
				predefined.pop()
				groups.push(group)
			}
		}

		if (groups.reduce((acc, val) => acc + val.length, 0) == studentIds.length) {
			return [groups, overMaxPredefined]
		}
	}

	return [[], overMaxPredefined]
}

function groupFromPredefined(predefinedGroup: maybeIdNumber[], students: idNumber[]): idNumber[] {
	const group: idNumber[] = []
	const oldIndexes: number[] = []
	let index
	for (const p of predefinedGroup) {
		if (p !== null) {
			group.push(p)
		} else {
			do {
				index = Math.floor(random() * students.length)
			} while (oldIndexes.includes(index))
			group.push(students[index])
			oldIndexes.push(index)
		}
	}
	return group
}

function tooManyReps(tableOfPartners: TableOfPartners, groupSet: Set<idNumber>, maxReps: number): boolean {
	// OBS: maxReps = 1: ingen har været i gruppe med de andre før
	//      maxReps = 2: hver elev har højst været i gruppe med én anden elev før
	const emptySet = new Set()
	for (const s of groupSet) {
		const previousPartners = groupSet.intersection(tableOfPartners.get(s) ?? emptySet)
		if (previousPartners.size > maxReps) {
			return true
		}
	}
	return false
}

// OBS: Man er selv en tidligere gruppemakker
function getTableOfPreviousPartners(studentIds: idNumber[], history: HistoryEntry[], maxBack: number): TableOfPartners {
	const groupsBack = Math.min(maxBack, history.length)
	const tableOfPartners: TableOfPartners = new Map<idNumber, Set<idNumber>>()
	for (const s of studentIds) {
		const partners = new Set<idNumber>([])
		for (let i = 1; i <= groupsBack; i++) {
			const groups = history[history.length - i].groups
			for (const g of groups) {
				if (g.includes(s)) {
					for (const gs of g) {
						partners.add(gs)
					}
				}
			}
		}
		tableOfPartners.set(s, partners)
	}
	return tableOfPartners
}

/**
 * n: number of students in class
 * g: max number of students per group
 */
function getTableGroupSizes(n: number, g: number = 4): number[] {
	if (n <= g) return [n]
	if (n % g == 0) return Array(n / g).fill(g)
	if (n % g == 1) {
		const a = Array(Math.floor(n / g) + 1).fill(g, 0, -2)
		a[a.length - 2] = g - 1
		a[a.length - 1] = 2
		return a
	}
	const a = Array(Math.floor(n / g) + 1).fill(g)
	a[a.length - 1] = n % g
	return a
}

/* Random Groups*/
export function createRandomGroups(students: idNumber[], numberOfGroups: number) {
	shuffleArray(students)
	const sizes = getRandomGroupSizes(students.length, numberOfGroups)
	const groups = []
	let i = 0
	for (const size of sizes) {
		groups.push(students.slice(i, i + size))
		i += size
	}
	return groups
}

function shuffleArray(array: unknown[]) {
	for (let i = array.length - 1; i >= 0; i--) {
		const j = Math.floor(random() * (i + 1))
		;[array[i], array[j]] = [array[j], array[i]]
	}
}

/**
 * ns: number of students
 * ng: number of groups
 */
function getRandomGroupSizes(ns: number, ng: number): number[] {
	const remainder = ns % ng
	const quotient = Math.floor(ns / ng)
	const a = Array(ng).fill(quotient)
	for (let i = 0; i < remainder; i++) {
		a[i]++
	}
	return a
}
