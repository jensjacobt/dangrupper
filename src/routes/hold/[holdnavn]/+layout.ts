import { getActiveGroupType, getCurrentClass } from '$lib/persistence.svelte'
import { redirect } from '@sveltejs/kit'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ params, route }) => {
	const currentClass = await getCurrentClass(params.holdnavn)

	if (route.id === '/hold/[holdnavn]') {
		console.log('Getting active group type from DB')
		const activeGroupType = await getActiveGroupType(currentClass.id)
		redirect(307, `/hold/${params.holdnavn}/${activeGroupType}/`)
	}

	console.log(`-----------------------------------------------\nOpening ${currentClass.name}`)

	return { currentClass }
}
