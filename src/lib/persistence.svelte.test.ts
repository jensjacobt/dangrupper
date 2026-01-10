import 'fake-indexeddb/auto'
import { clear } from 'idb-keyval'
import { beforeEach, expect, test } from 'vitest'
import { addClass, getClasses } from './persistence.svelte'

/* DB tests */

beforeEach(() => {
	clear()
})

test('addClass preserves class name and students', async () => {
	expect(await getClasses()).toStrictEqual([])

	const className = 'test class'
	const students = [
		{ id: 0, name: 'Navn På Elev 1' },
		{ id: 1, name: 'Navn På Elev 2' },
		{ id: 2, name: 'Navn På Elev 3' },
	]
	await addClass(className, students)

	const klass = (await getClasses())[0]
	expect(klass.name).toStrictEqual(className)
	expect(klass.students).toStrictEqual(students)
})

test('IndexedDB resets between tests', async () => {
	expect(await getClasses()).toStrictEqual([])
})

test('addClass trims class name', async () => {
	expect(await getClasses()).toStrictEqual([])

	const className = ' class  '
	const students = [{ id: 0, name: 'Navn På Elev' }]
	await addClass(className, students)

	const klass = (await getClasses())[0]
	expect(klass.name).toStrictEqual(className.trim())
})

test('addClass disallows existing class name (even with leading/trailing whitespace)', async () => {
	expect(await getClasses()).toStrictEqual([])

	const className = 'class'
	const students = [{ id: 0, name: 'Navn På Elev' }]
	await addClass(className, students)

	const klass = (await getClasses())[0]
	expect(klass.name).toStrictEqual(className)

	const className2 = ' class  '
	const students2 = [{ id: 0, name: 'Navn På Elev' }]
	try {
		await addClass(className2, students2)
	} catch (error) {
		// @ts-expect-error error.message
		expect(error.message).toStrictEqual('Holdnavn allerede i brug – skriv et andet.')
	}
})
