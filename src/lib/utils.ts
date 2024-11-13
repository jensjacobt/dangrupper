export function urlNameToClassName(urlName: string): string {
	return urlName.replaceAll('_', ' ');
}

export function classNameUrlName(urlName: string): string {
	return urlName.replaceAll(' ', '_');
}
