import { delMany, get, keys, set, update } from 'idb-keyval';
import { validateClassName, validateStudents } from './validation.svelte';

/* Get from and set in DB */
export function getStored<T>(key: string): Promise<T | undefined> {
	return get(key);
}

export function setStored<T>(key: string, value: T): void {
	set(key, value).catch((error) => console.error('IDB Error Setting:', error));
}

/* Classes */
const classesKey = 'classes';

export function getClasses(): Promise<Class[] | undefined> {
	return get(classesKey);
}

function trimAndValidateClass(
	className: string,
	students: Student[]
): [className: string, students: Student[]] {
	className = className.trim();
	let message = validateClassName(className);
	if (message) throw Error(message);

	students = students.map((s) => ({ ...s, name: s.name.trim() })).filter((s) => s.name != '');
	message = validateStudents(students);
	if (message) throw Error(message);

	return [className, students];
}

export async function addClass(className: string, students: Student[]): Promise<void> {
	[className, students] = trimAndValidateClass(className, students);

	const classes = await get(classesKey);
	if (Array.isArray(classes) && classes.some((c) => c.name == className)) {
		throw Error('Holdnavn allerede i brug – skriv et andet');
	}

	await update(classesKey, (classes: Class[] | undefined) => {
		return (classes || []).concat([
			{
				id: crypto.randomUUID(),
				name: className,
				students: students
			}
		]);
	});
}

export async function editClass(id: string, className: string, students: Student[]): Promise<void> {
	console.log('id:', id);
	console.log('className:', className);
	console.log('students:', students);

	[className, students] = trimAndValidateClass(className, students);

	const classes = (await get(classesKey)) as Class[] | undefined;
	if (Array.isArray(classes) && !classes.some((c) => c.id)) {
		throw Error('Holdet findes ikke i databasen');
	}

	await update(classesKey, (classes: Class[] | undefined) => {
		let newClasses = classes || [];
		const index = newClasses.findIndex((c) => c.id == id);
		if (index >= 0) {
			newClasses[index] = { id, name: className, students };
		} else {
			console.error('Holdet findes ikke i databasen (men blev fundet for et øjeblik siden)');
		}
		return newClasses;
	});
}

export async function removeClass(klass: Class): Promise<void> {
	await update(classesKey, (classes: Class[] | undefined) => {
		return (classes || []).filter((c) => c.name != klass.name);
	});
	const storedKeys = await keys();
	const keysToDelete = storedKeys.filter((key) => typeof key == 'string' && key.includes(klass.id));
	await delMany(keysToDelete);
}
