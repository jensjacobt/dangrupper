declare type Grade = -3 | 0 | 2 | 4 | 7 | 10 | 12

declare type idNumber = number // must be a positive integer

declare type maybeIdNumber = idNumber | null

declare type Student = {
	id: idNumber
	name: string
	gender?: 'm' | 'k'
	writtenGrade?: Grade
	oralGrade?: Grade
	effort?: Grade
}

declare type Class = {
	id: string
	name: string
	students: Student[]
}

declare type ClassBeingAdded = {
	name: string
	students: Student[]
}

declare type ActiveGroupType = 'bordgrupper' | 'manuelle-grupper' | 'tilfældige-grupper'

declare type TableGroups = {
	maxRecurring: number
	nLastGroups: number
	predefinedGroups: maybeIdNumber[][]
	currentGroups: idNumber[][]
	warningText: string
	errorText: string
	saved: boolean
	advanced: boolean
	manualGroupSizes: number[]
}

declare type HistoryEntry = {
	createdAt: string
	groups: idNumber[][]
}

declare type ManualGroups = {
	currentGroups: idNumber[][]
}

declare type RandomGroups = {
	type: SizeType
	groupSize: number
	groupNumber: number
	absentStudentIds: idNumber[]
	currentGroups: idNumber[][]
}

declare type SizeType = 'groupSize' | 'groupNumber'

type ExportObject = {
	classes: Class[]
	keyval: [key: IDBValidKey, val: any][] // eslint-disable-line @typescript-eslint/no-explicit-any
}

type ImportObject = {
	classes: (Class & { conflictingClass: Class? })[]
	keyval: [key: string, val: any][] // eslint-disable-line @typescript-eslint/no-explicit-any
}
