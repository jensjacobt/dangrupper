// Static site know-how:
// https://khromov.se/the-missing-guide-to-understanding-adapter-static-in-sveltekit/

export const prerender = false; // for SPA
export const ssr = false; // for SPA
export const trailingSlash = 'always'; // to match behavior of host (Netlify)

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async () => {
	// Indlæs holdnavne og returnér dem
	return {
		posts: ['post1', 'post2']
	};
};
