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

type overMaxEntry = {
	pair: number[]
	groupsAgo: number
}

export function createTableGroups(
	tableGroupInfo: TableGroupInfo,
): [groups: idNumber[][], overMaxPredefined: overMaxEntry[][]] {
	if (tableGroupInfo.predefinedGroups.flat().length != tableGroupInfo.studentIds.length) {
		throw Error('Fejl i programmet: Forudbestemte gruppestørrelser matcher ikke antal elever.')
	}

	const maxReps = 1 + tableGroupInfo.maxRecurring
	const groupsBack = Math.min(tableGroupInfo.nLastGroups, tableGroupInfo.history.length)
	const overMaxPredefined: overMaxEntry[][] = []
	const tableOfPartners = getTableOfPreviousPartners(tableGroupInfo.studentIds, tableGroupInfo.history, groupsBack)

	let preassigned = new Set<idNumber>()
	const nonNull = (s: maybeIdNumber) => s !== null
	for (const predefinedGroup of tableGroupInfo.predefinedGroups) {
		const predefinedStudentsOfGroup = new Set(predefinedGroup.filter(nonNull))
		const overMaxEntries: overMaxEntry[] = []
		if (predefinedStudentsOfGroup.size > 0) {
			for (const studentId of predefinedStudentsOfGroup) {
				if (!tableGroupInfo.studentIds.includes(studentId)) {
					throw Error(`Den indtastede person med id "${studentId}" kunne ikke findes på listen over elever.`)
				}
			}

			if (tooManyReps(tableOfPartners, predefinedStudentsOfGroup, maxReps)) {
				for (const s of predefinedStudentsOfGroup) {
					tableOfPartners.set(s, (tableOfPartners.get(s) as Set<idNumber>).difference(predefinedStudentsOfGroup))
				}

				const studentIds = Array.from(predefinedStudentsOfGroup)
				for (let i = 0; i < studentIds.length - 1; i++) {
					const studentId = studentIds[i]
					for (let groupsAgo = 1; groupsAgo <= groupsBack; groupsAgo++) {
						const groups = tableGroupInfo.history[tableGroupInfo.history.length - groupsAgo].groups
						for (const group of groups) {
							if (group.includes(studentId)) {
								for (let j = i + 1; j < studentIds.length; j++) {
									const partnerId = studentIds[j]
									if (group.includes(partnerId)) {
										overMaxEntries.push({
											pair: [studentId, partnerId].toSorted(),
											groupsAgo: groupsAgo,
										})
									}
								}
							}
						}
					}
				}
			}
		}
		overMaxPredefined.push(overMaxEntries)
		preassigned = preassigned.union(predefinedStudentsOfGroup)
	}

	const predefinedGroups = tableGroupInfo.predefinedGroups.toReversed()

	const assignableStudents = tableGroupInfo.studentIds.filter((s) => !preassigned.has(s))
	const preassignedStudents = predefinedGroups.flat().filter((s) => s !== null)

	if (assignableStudents.length + preassignedStudents.length !== tableGroupInfo.studentIds.length) {
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

		if (groups.reduce((acc, val) => acc + val.length, 0) == tableGroupInfo.studentIds.length) {
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
function getTableOfPreviousPartners(
	studentIds: idNumber[],
	history: HistoryEntry[],
	groupsBack: number,
): TableOfPartners {
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
export function getTableGroupSizes(n: number, g: number = 4): number[] {
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
