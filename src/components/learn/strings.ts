// UI copy for the /learn pages (module layout, glossary, sources, videos).
// Kept next to the learn components instead of inline `es ? … : …` literals
// so the EN/ES pairs live side by side and can be reviewed together.

import type { Lang } from '../../lib/learn';

export const LEARN_UI = {
	en: {
		learn: 'Learn',
		home: 'Home',
		courseShort: 'Agentic systems',
		courseFull: 'Engineering agentic systems',
		breadcrumb: 'Breadcrumb',
		courseMap: 'Course map',
		module: 'Module',
		phase: 'Phase',
		minRead: 'min read',
		updated: 'Updated',
		positionInCourse: 'Position in the course',
		moduleOf: (n: number, total: number) => `Module ${n} of ${total}`,
		onThisPage: 'On this page',
		startHere: 'START HERE',
		moduleNav: 'Module navigation',
		previous: '← Previous',
		next: 'Next →',
		glossary: 'Glossary',
		reference: 'Reference',
		filterPlaceholder: 'Filter terms…',
		filterLabel: 'Filter glossary terms',
		terms: 'terms',
		noMatches: 'No matches.',
		glossaryDescription: (n: number) =>
			`The ${n} terms of the agentic-systems field, each defined in one sentence: from the context window to the lethal trifecta, from GRPO to task time-horizon.`,
	},
	es: {
		learn: 'Aprende',
		home: 'Inicio',
		courseShort: 'Sistemas agénticos',
		courseFull: 'Ingeniería de sistemas agénticos',
		breadcrumb: 'Migas de pan',
		courseMap: 'Índice del curso',
		module: 'Módulo',
		phase: 'Fase',
		minRead: 'min de lectura',
		updated: 'Actualizado',
		positionInCourse: 'Posición en el curso',
		moduleOf: (n: number, total: number) => `Módulo ${n} de ${total}`,
		onThisPage: 'En esta página',
		startHere: 'EMPIEZA AQUÍ',
		moduleNav: 'Navegación entre módulos',
		previous: '← Anterior',
		next: 'Siguiente →',
		glossary: 'Glosario',
		reference: 'Referencia',
		filterPlaceholder: 'Filtrar términos…',
		filterLabel: 'Filtrar términos del glosario',
		terms: 'términos',
		noMatches: 'Sin coincidencias.',
		glossaryDescription: (n: number) =>
			`Los ${n} términos del campo de los sistemas agénticos, definidos en una frase: de la ventana de contexto a la lethal trifecta, de GRPO al horizonte temporal de tarea.`,
	},
} as const satisfies Record<Lang, Record<string, unknown>>;

export function learnUi(lang: Lang) {
	return LEARN_UI[lang];
}
