import { getActiveGroupType } from '$lib/persistence.svelte'
import { urlNameToClassName } from '$lib/utils'
import { error, redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ params, parent, route }) => {
	const className = urlNameToClassName(params.holdnavn)

	const { classes } = await parent()
	const currentClass = classes.find((c) => c.name == className)
	if (!currentClass) {
		console.error(`"${className}" blev ikke fundet blandt holdnavne`)
		error(404, 'Holdet blev ikke fundet')
	}

	if (route.id === '/hold/[holdnavn]') {
		const activeGroupType = await getActiveGroupType(currentClass.id)
		redirect(307, `/hold/${params.holdnavn}/${activeGroupType}/`)
	}

	console.log(`-----------------------------------------------\nFound class ${className}`)

	return { currentClass }
}
