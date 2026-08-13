import { describe, expect, test } from 'vitest'
import { createRandomGroups, createTableGroups, getTableGroupSizes } from './groupGenerator'

// https://github.com/sapegin/vitest-cheat-sheet

/* Random Groups */
describe('Random Groups test', () => {
	test('with 0 students in 3 groups', () => {
		const students: number[] = []
		const groups = createRandomGroups(students, 3)

		expect(groups.length).toBe(3)
		expect(groups[0].length).toBe(0)
		expect(groups[1].length).toBe(0)
		expect(groups[2].length).toBe(0)
	})

	test('with 1 students in 3 groups', () => {
		const students: number[] = [5]
		const groups = createRandomGroups(students, 3)

		expect(groups.length).toBe(3)
		expect(groups[0].length).toBe(1)
		expect(groups[1].length).toBe(0)
		expect(groups[2].length).toBe(0)
	})

	test('with 2 students in 3 groups', () => {
		const students: number[] = [5, 7]
		const groups = createRandomGroups(students, 3)

		expect(groups.length).toBe(3)
		expect(groups[0].length).toBe(1)
		expect(groups[1].length).toBe(1)
		expect(groups[2].length).toBe(0)
	})

	test('with 9 students in 3 groups', () => {
		const students = [0, 1, 2, 3, 4, 5, 6, 7, 8]
		const groups = createRandomGroups(students, 3)

		expect(groups.length).toBe(3)
		expect(groups[0].length).toBe(3)
		expect(groups[1].length).toBe(3)
		expect(groups[2].length).toBe(3)
		// except groupStudents to equal groups ignoring order
		const groupStudents = groups.flat()
		expect(groupStudents).toEqual(expect.arrayContaining(students))
		expect(students).toEqual(expect.arrayContaining(groupStudents))
	})
})

/* Table Groups */
describe('Table Groups test', () => {
	test('group sizes of used for automatic predefined groups', () => {
		expect(getTableGroupSizes(0)).toStrictEqual([0])
		expect(getTableGroupSizes(1)).toStrictEqual([1])
		expect(getTableGroupSizes(3)).toStrictEqual([3])
		expect(getTableGroupSizes(4)).toStrictEqual([4])
		expect(getTableGroupSizes(5)).toStrictEqual([3, 2])
		expect(getTableGroupSizes(6)).toStrictEqual([4, 2])
		expect(getTableGroupSizes(7)).toStrictEqual([4, 3])
		expect(getTableGroupSizes(8)).toStrictEqual([4, 4])
		expect(getTableGroupSizes(9)).toStrictEqual([4, 3, 2])
		expect(getTableGroupSizes(10)).toStrictEqual([4, 4, 2])
	})

	test('happy path - no history - no predefined', () => {
		const tableGroupInfo = {
			history: [],
			studentIds: [0, 1, 2, 3, 4, 5, 6, 7, 8],
			predefinedGroups: [
				[null, null, null, null],
				[null, null, null],
				[null, null],
			],
			maxRecurring: 0,
			nLastGroups: 3,
		}
		const [groups, overMaxPredefined] = createTableGroups(tableGroupInfo)

		expect(overMaxPredefined).toEqual([[], [], []])

		for (let i = 0; i < tableGroupInfo.predefinedGroups.length; i++) {
			const preLength = tableGroupInfo.predefinedGroups[i].length
			expect(groups[i].length).toBe(preLength)
		}
		expect(new Set(groups.flat())).toEqual(new Set(tableGroupInfo.studentIds))
	})

	test('happy path - has history - no predefined', () => {
		const hisGroups = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
		]
		const tableGroupInfo = {
			history: [
				{
					createdAt: 'dateString', // bad data
					groups: hisGroups,
				},
			],
			studentIds: [0, 1, 2, 3, 4, 5, 6, 7, 8],
			predefinedGroups: [
				[null, null, null],
				[null, null, null],
				[null, null, null],
			],
			maxRecurring: 0,
			nLastGroups: 3,
		}
		const [groups, overMaxPredefined] = createTableGroups(tableGroupInfo)

		expect(overMaxPredefined).toEqual([[], [], []])

		for (let i = 0; i < tableGroupInfo.predefinedGroups.length; i++) {
			const preLength = tableGroupInfo.predefinedGroups[i].length
			expect(groups[i].length).toBe(preLength)
		}
		expect(new Set(groups.flat())).toEqual(new Set(tableGroupInfo.studentIds))

		for (const group of groups) {
			for (let i = 0; i < group.length; i++) {
				for (const hisGroup of hisGroups) {
					if (hisGroup.includes(group[i])) {
						for (let j = i + 1; j < group.length; j++) {
							expect(hisGroup.includes(group[j])).toBeFalsy()
						}
					}
				}
			}
		}
	})

	test('warning path - has 1 history - two predefined', () => {
		const hisGroups = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[9, 10, 11],
		]
		const tableGroupInfo = {
			history: [
				{
					createdAt: 'dateString', // bad data
					groups: hisGroups,
				},
			],
			studentIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
			predefinedGroups: [
				[3, null, 4],
				[null, null, null],
				[null, null, null],
				[null, null, null],
			],
			maxRecurring: 0,
			nLastGroups: 3,
		}
		const [groups, overMaxPredefined] = createTableGroups(tableGroupInfo)

		expect(overMaxPredefined).toEqual([[{ groupsAgo: 1, pair: [3, 4] }], [], [], []])

		for (let i = 0; i < tableGroupInfo.predefinedGroups.length; i++) {
			const preLength = tableGroupInfo.predefinedGroups[i].length
			expect(groups[i].length).toBe(preLength)
		}
		expect(new Set(groups.flat())).toEqual(new Set(tableGroupInfo.studentIds))

		expect(groups[0][0]).toStrictEqual(3)
		expect(groups[0][1]).not.toEqual(5)
		expect(groups[0][2]).toStrictEqual(4)
	})

	test('warning path - has 2 history - two predefined', () => {
		const hisGroups1 = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[9, 10, 11],
		]
		const hisGroups2 = [
			[0, 4, 8],
			[3, 7, 11],
			[6, 10, 2],
			[9, 1, 5],
		]
		const tableGroupInfo = {
			history: [
				{
					createdAt: 'dateString1', // bad data
					groups: hisGroups1,
				},
				{
					createdAt: 'dateString2', // bad data
					groups: hisGroups2,
				},
			],
			studentIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
			predefinedGroups: [
				[3, null, 4],
				[null, null, null],
				[null, null, null],
				[null, null, null],
			],
			maxRecurring: 0,
			nLastGroups: 3,
		}
		const [groups, overMaxPredefined] = createTableGroups(tableGroupInfo)

		expect(overMaxPredefined).toEqual([[{ groupsAgo: 2, pair: [3, 4] }], [], [], []])

		for (let i = 0; i < tableGroupInfo.predefinedGroups.length; i++) {
			const preLength = tableGroupInfo.predefinedGroups[i].length
			expect(groups[i].length).toBe(preLength)
		}
		expect(new Set(groups.flat())).toEqual(new Set(tableGroupInfo.studentIds))

		expect(groups[0][0]).toStrictEqual(3)
		expect([5, 7, 11, 0, 8]).not.toContain(groups[0][1])
		expect(groups[0][2]).toStrictEqual(4)
	})

	test('throws on mismatch in number of students og predefined group spots', () => {
		const tableGroupInfo = {
			history: [],
			studentIds: [0, 1, 2, 3, 4, 5, 6, 7],
			predefinedGroups: [
				[null, null, null, null],
				[null, null, null],
				[null, null],
			],
			maxRecurring: 0,
			nLastGroups: 3,
		}
		expect(() => createTableGroups(tableGroupInfo)).toThrow(
			'Fejl i programmet: Forudbestemte gruppestørrelser matcher ikke antal elever.',
		)
	})

	test('throws on doubly predefined student', () => {
		const tableGroupInfo = {
			history: [],
			studentIds: [0, 1, 2, 3, 4, 5, 6, 7, 8],
			predefinedGroups: [
				[null, 6, null, null],
				[6, null, null],
				[null, null],
			],
			maxRecurring: 0,
			nLastGroups: 3,
		}
		expect(() => createTableGroups(tableGroupInfo)).toThrow(
			'Antal elever der skulle placeres stemmer ikke med antal forudbestemte medlemmer.',
		)
	})

	test('throws on nonexistent predefined student', () => {
		const tableGroupInfo = {
			history: [],
			studentIds: [0, 1, 2, 3, 4, 5, 6, 7, 8],
			predefinedGroups: [
				[10, null, null, null],
				[null, null, null],
				[null, null],
			],
			maxRecurring: 0,
			nLastGroups: 3,
		}
		expect(() => createTableGroups(tableGroupInfo)).toThrow(
			'Den indtastede person med id "10" kunne ikke findes på listen over elever.',
		)
	})
})
