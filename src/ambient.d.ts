declare type Grade = -3 | 0 | 2 | 4 | 7 | 10 | 12;

declare type Student = {
	id: number;
	name: string;
	gender?: 'm' | 'k';
	writtenGrade?: Grade;
	oralGrade?: Grade;
	effort?: Grade;
};
