import { delMany, entries, get, keys, set, setMany, update } from 'idb-keyval';
import { toaster } from './toaster-svelte';
import { validateClassName, validateStudents } from './validation.svelte';

const classesKey = 'classes';
const classBeingAddedKey = 'class-being-added';
const tableGroupsKey = 'tableGroups';
const tableGroupsHistoryKey = `${tableGroupsKey}-history`;

/* Get from and set in DB with claimed type and logging/warnings */
function getStored<T>(key: string): Promise<T | undefined> {
	return get(key).catch((error) => {
		console.error(`IDB Error Getting ${key}:`, error);
		toaster.error({
			title: "Læsning fra databasen fejlede",
			description: `Kontakt udvikleren hvis det fortsætter.`
		});
	});;
}

function setStored<T>(key: string, value: T, displayName: string): void {
	set(key, value).catch((error) => {
		console.error(`IDB Error Setting ${key}:`, error);
		toaster.error({
			title: "Skrivning til databasen fejlede",
			description: `De netop ændrede ${displayName} kunne ikke gemmes til databasen. (Prøv evt. at lave en ændring igen og se om det går bedre i den omgang.)`
		});
	});
}

/* Classes */
export async function getClasses() {
	return (await getStored<Class[]>(classesKey)) ?? [];
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
		throw Error('Holdnavn allerede i brug – skriv et andet.');
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
		throw Error('Holdet findes ikke i databasen.');
	}

	await update(classesKey, (classes: Class[] | undefined) => {
		const newClasses = classes ?? [];
		const index = newClasses.findIndex((c) => c.id == id);
		if (index >= 0) {
			newClasses[index] = { id, name: className, students };
		} else {
			console.error('Holdet findes ikke i databasen (men blev fundet for et øjeblik siden).');
		}
		return newClasses;
	});
}

export async function removeClass(klass: Class): Promise<void> {
	await update(classesKey, (classes: Class[] | undefined) => {
		return (classes ?? []).filter((c) => c.id != klass.id);
	});
	const storedKeys = await keys();
	const keysToDelete = storedKeys.filter((key) => typeof key == 'string' && key.includes(klass.id));
	await delMany(keysToDelete);
}

export async function getClassBeingAdded() {
	return (await getStored<ClassBeingAdded>(classBeingAddedKey)) ?? {
		name: "",
		students: []
	}
}

export async function setClassBeingAdded(className: string, students: Student[]) {
	const classBeingAdded = { name: className, students: students };
	setStored<ClassBeingAdded>(classBeingAddedKey, classBeingAdded, "data om klassen, der skal oprettes,");
}

/* Table Groups */
export async function getTableGroups(classId: string) {
	const key = `${tableGroupsKey}_${classId}`;
	return (await getStored<TableGroups>(key)) ?? {
			maxRecurring: 0,
			nLastGroups: 3,
			predefinedGroups: [],
			currentGroups: [],
            warningText: '',
            errorText: '',
            saved: false
	}
}

export function setTableGroups(classId: string, tableGroups: TableGroups) {
	const key = `${tableGroupsKey}_${classId}`;
	setStored<TableGroups>(key, tableGroups, "bordgrupper");
}

export async function getTableGroupsHistory(classId: string) {
	const key = `${tableGroupsHistoryKey}_${classId}`
	return (await getStored<HistoryEntry[]>(key)) ?? [];
}

export async function addToTableGroupsHistory(classId: string, historyEntry: HistoryEntry) {
	console.log('adding to history:', historyEntry);
	const key = `${tableGroupsHistoryKey}_${classId}`;
	await update(key, (his => ((his ?? []).concat([historyEntry]))));
}

export async function removeFromTableGroupsHistory(classId: string, historyEntry: HistoryEntry) {
	console.log('removing from history:', historyEntry);
	const key = `${tableGroupsHistoryKey}_${classId}`;
	await update(key, (his => {
		const old = (his ?? [] ) as HistoryEntry[];
		return old.filter(h => h.createdAt !== historyEntry.createdAt);
	}));
	return await getTableGroupsHistory(classId);
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
	if (classesIndex === -1) {
		throw Error('Ingen hold er oprettet');
	}	
	const obj = {'classes': a[classesIndex][1], 'keyval': a.toSpliced(classesIndex, 1)};
	return JSON.stringify(obj);
}

export async function exportClassToJson(classId: string) {
	const classes = await getClasses();
	const klass = classes.find(c => c.id === classId);
	if (!klass) {
		throw Error('Holdet findes ikke');
	}
	const s = "_" + klass.id;
	const classData = (await entries()).filter(e => (e[0] as string).includes(s));
	const obj: ExportObject = {'classes': [klass], 'keyval': classData};
	return JSON.stringify(obj);
}

export function downloadJson(filename: string, json: Promise<string>) {
	json
		.then((json) => {
			const a = document.createElement("a");
			a.href = window.URL.createObjectURL(new Blob([json], {type: "text/plain"}));
			a.download = filename;
			a.click();
			a.remove();
		}, 
		(e) => { 
			console.error('export to json failed:', e);
			toaster.error({
				title: "Eksport fejlede",
				description: e.message
			});
		});
}

/* Import */
export async function getConflictingClasses(importObject: ImportObject): Promise<ImportObject> {
	const currentClasses = await getClasses();
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
	for (let i = 0; i < classesToImport.length; i++) {
		while (currentClasses.some(c => c.name == classesToImport[i].name)) {
			classesToImport[i].name += "*"
		}
	}
	const newClasses = currentClasses.concat(classesToImport);
	
	const keyvals = otherKeyvals.concat([[classesKey, newClasses]]);

	await setMany(keyvals);
}
