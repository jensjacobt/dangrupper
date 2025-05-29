declare type Grade = -3 | 0 | 2 | 4 | 7 | 10 | 12;

declare type idNumber = number;

declare type maybeIdNumber = idNumber | null;

declare type Student = {
	id: idNumber;
	name: string;
	gender?: 'm' | 'k';
	writtenGrade?: Grade;
	oralGrade?: Grade;
	effort?: Grade;
};

declare type Class = {
	id: string;
	name: string;
	students: Student[];
};

declare type TableGroups = {
	maxRecurring: number;
	nLastGroups: number;
	predefinedGroups: maybeIdNumber[][];
	currentGroups: idNumber[][];
	warningText: string;
    errorText: string;
    saved: boolean;
};
