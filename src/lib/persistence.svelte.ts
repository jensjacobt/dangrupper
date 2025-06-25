import { delMany, entries, get, keys, set, setMany, update } from 'idb-keyval';
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

export async function getClasses(): Promise<Class[]> {
	return (await get(classesKey)) ?? [];
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
		return (classes ?? []).concat([
			{
				id: crypto.randomUUID(),
				name: className,
				students: students
			}
		]);
	});
}

export async function editClass(id: string, className: string, students: Student[]): Promise<void> {
	[className, students] = trimAndValidateClass(className, students);

	const classes = (await get(classesKey)) as Class[] | undefined;
	if (Array.isArray(classes) && !classes.some((c) => c.id)) {
		throw Error('Holdet findes ikke i databasen');
	}

	await update(classesKey, (classes: Class[] | undefined) => {
		let newClasses = classes ?? [];
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
		return (classes ?? []).filter((c) => c.name != klass.name);
	});
	const storedKeys = await keys();
	const keysToDelete = storedKeys.filter((key) => typeof key == 'string' && key.includes(klass.id));
	await delMany(keysToDelete);
}

/* Table Groups History */
export async function addToHistory(historyKey: string, groups: idNumber[][]) {
	console.log('adding to history:', groups);
	await update(historyKey, (history: idNumber[][][] | undefined) => {
		return (history ?? []).concat([groups]);
	});
}

/* Export */
export async function exportDatabaseToJson() {
	const a = await entries();
	let classesIndex = -1;
	for (let i = 0; i < a.length; i++) {
		if (a[i][0] === 'classes') {
			classesIndex = i;
			break;
		}
	}
	if (classesIndex > -1) {
		const obj = {'classes': a[classesIndex][1], keyval: a.toSpliced(classesIndex, 1)};
		return JSON.stringify(obj);
	} else {
		throw Error('Ingen klasser er oprettet');
	}
}

/* Import */
export async function getConflictingClasses(importObject: ImportObject): Promise<ImportObject> {
	const currentClasses: Class[] = await get(classesKey) ?? [];
	for (let i = 0; i < importObject.classes.length; i++) {
		const klass = importObject.classes[i];
		for (const currentClass of currentClasses) {
			if (klass.id == currentClass.id) {
				importObject.classes[i].conflictingClass = currentClass;
				break;
			}
		}
	}
	return importObject;
}

export async function importClasses(importObject: ImportObject, idsToImport: string[]) {
	const classesToImport = importObject.classes.filter(c => idsToImport.includes(c.id));
	const otherKeyvals = importObject.keyval.filter(kv => idsToImport.some(id => kv[0].includes(id)));

	const currentClasses = await getClasses();
	const newClasses = currentClasses.concat(classesToImport);
	
	const keyvals = otherKeyvals.concat([[classesKey, newClasses]]);

	await setMany(keyvals);
}
