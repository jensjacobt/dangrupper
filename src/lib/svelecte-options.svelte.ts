import { config } from 'svelecte'

export function configureSvelecteGlobalOptions() {
	config.placeholder = ''
	config.clearable = true

	config.i18n.empty = 'Ingen valgmuligheder'
	config.i18n.nomatch = 'Ingen valgmuligheder matcher'
	config.i18n.max = (num) => `Der må højst vælges ${num} elementer`
	config.i18n.collapsedSelection = (count) => `${count} valgt`

	config.i18n.aria_selected = (opts) =>
		opts.length ? `Valgmulighed${opts.length > 1 ? 'erne' : 'en'} ${opts.join(', ')} valgt.` : ''
	config.i18n.aria_listActive = (opt, labelField, count) =>
		// @ts-expect-error No index signature
		`Du har pt. fokus på valgmuligheden ${opt[labelField]}. ${count} resultat${count > 1 ? 'er' : ''} tilgængelige.`
	config.i18n.aria_inputFocused = () =>
		'Rullelisten er fokuseret, skriv for at indsnævne listen, og tryk pil ned for at scrolle gennem listen'
	config.i18n.aria_removeItemLabel = () => `Fjern element`
}
