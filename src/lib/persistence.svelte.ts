import { get, set } from 'idb-keyval';

// Inspiration:
// https://www.youtube.com/watch?v=HnNgkwHZIII
// https://blog.kowalczyk.info/article/persisted-svelte-store-indexeddb.html

export class IdbStore<T> {
	#key: string;
	#value = $state<T>() as T;
	// #crossTab: boolean; // Should crossTab be implemented? If so, uncomment all code in this class
	// #lsKey: string;

	private constructor(key: string, value: T) {
		this.#key = key;
		this.#value = value;
		// this.#lsKey = 'store-notify:' + key;
		// this.#crossTab = crossTab;
		// if (this.#crossTab) {
		// 	   window.addEventListener("storage", this.storageChanged, false);
		// }
	}

	static async create(key: string, initialValue: null | boolean | number | string | object) {
		const storedValue = await get(key);

		if (storedValue !== undefined) {
			return new IdbStore(key, storedValue);
		} else if (initialValue === null) {
			throw Error('Key not in store');
		} else {
			const store = new IdbStore(key, initialValue);
			store.value = initialValue;
			return store;
		}
	}

	get value() {
		return this.#value;
	}

	set value(newValue: T) {
		this.#value = newValue;
		set(this.#key, newValue)
			// .then(() => {
			// 	if (this.#crossTab) {
			// 		const n = +localStorage.getItem(this.#lsKey) || 0;
			// 		localStorage.setItem(this.#lsKey, `${n + 1}`);
			// 	}
			// })
			.catch((error) => console.error('IdbStore Error Setting:', error));
	}

	// private getCurrentValue() {
	// 	get(this.#key).then((storedValue) => {
	// 		this.#value = storedValue;
	// 	});
	// }

	// private storageChanged(event: any) {
	// 	   if (event.storageArea === localStorage && event.key === this.#lsKey) {
	// 	      this.getCurrentValue();
	//     }
	// }
}
