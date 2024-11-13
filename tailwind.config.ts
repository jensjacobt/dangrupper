import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

import { join } from 'path';
import { skeleton } from '@skeletonlabs/skeleton/plugin';
import * as themes from '@skeletonlabs/skeleton/themes';

export default {
	darkMode: 'selector',
	
	content: [
		'./src/**/*.{html,js,svelte,ts}',
        join(require.resolve('@skeletonlabs/skeleton-svelte'), '../**/*.{html,js,svelte,ts}')
	],

	theme: {
		extend: {}
	},

	plugins: [
		typography, 
		forms,
		skeleton({
            // NOTE: each theme included will be added to your CSS bundle
            themes: [ themes.cerberus, themes.rocket ]
        })
	]
} satisfies Config;
