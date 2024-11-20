import type { ActionReturn } from 'svelte/action';

export function validity(input: HTMLInputElement, validator: (s: string) => string): ActionReturn {
	function validate() {
		input.setCustomValidity(validator(input.value) ?? '');
	}

	input.addEventListener('input', validate);
	validate();

	return {
		destroy() {
			input.removeEventListener('input', validate);
		}
	};
}
