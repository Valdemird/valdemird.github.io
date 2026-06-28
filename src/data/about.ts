/**
 * About page content, keyed by locale. Markup/styles/scripts live in
 * src/components/pages/AboutPage.astro — this module only holds the data,
 * sharing what is identical across locales (tech names, cert names, dates).
 */

export type AboutLocale = 'en' | 'es';

export type TechDomain = { domain: string; tools: readonly string[]; accent: string };
export type TimelineItem = { year: string; title: string; place: string; desc: string; active: boolean };
export type CredentialItem = { name: string; year: string };
export type Belief = { title: string; desc: string; postSlug: string; linkLabel: string };
export type QuickFact = { label: string; value: string };
export type StartHerePost = { slug: string; title: string };
export type FeaturedCredential = {
	issuedDisplay: string;
	verifyLabel: string;
	blurb: string;
};

// Shared across locales — names, dates and URLs don't translate.
export const FEATURED_CERT_SHARED = {
	name: 'Claude Certified Architect – Foundations Certification',
	issuer: 'Anthropic Education',
	issuedISO: '2026-06-05',
	recipient: 'Sebastian Castano Jara',
	verifyUrl: 'https://verify.skilljar.com/c/u6m2t562rgvx',
} as const;

export const ABOUT_PHOTO = { src: '/images/about/sebastian.webp', width: 640, height: 640 } as const;

// Accent tokens are shared — same card order in both locales.
const ACCENT = {
	frontend: 'var(--color-accent)',
	backend: 'var(--color-success)',
	devops: 'var(--color-warning)',
	ai: 'oklch(0.6 0.15 300)',
} as const;

// Certification names and dates are identical in both locales.
const CERTS: readonly CredentialItem[] = [
	{ name: 'AWS Certified Cloud Practitioner', year: '2023' },
	{ name: 'EF SET English C2 Proficient', year: '2020' },
	{ name: 'Learning How to Learn, Coursera', year: '2020' },
];

type AboutContent = {
	heroLabel: string;
	/** One-line Fraunces identity statement — the page's h1. */
	identityLine: string;
	/** Mono meta line under the identity: name · role · place. */
	heroMeta: string;
	photoAlt: string;
	quickFacts: readonly QuickFact[];
	/** Narrative paragraphs — HTML strings (inline links), rendered with set:html. */
	narrative: readonly string[];
	/** Short pivot line rendered in italic Fraunces between narrative paragraphs. */
	pivotLine: string;
	/** Index in `narrative` AFTER which the pivot line renders. */
	pivotAfter: number;
	now: { updatedDisplay: string; items: readonly string[] };
	sections: {
		tech: string;
		journey: string;
		now: string;
		beliefs: string;
		proof: string;
		contact: string;
		startHere: string;
	};
	techDomains: readonly TechDomain[];
	timeline: readonly TimelineItem[];
	education: readonly CredentialItem[];
	certs: readonly CredentialItem[];
	beliefs: readonly Belief[];
	featuredCert: FeaturedCredential;
	credentialEyebrow: string;
	/** Closing paragraph — HTML string. */
	closing: string;
	startHere: readonly StartHerePost[];
	labCta: string;
};

export const ABOUT_CONTENT: Record<AboutLocale, AboutContent> = {
	en: {
		heroLabel: 'About',
		identityLine: 'I build software and show my work.',
		heroMeta: 'Sebastian Castano Jara · Senior Software Engineer · Cali, Colombia',
		photoAlt: 'Portrait of Sebastian Castano Jara',
		quickFacts: [
			{ label: 'Based in', value: 'Cali, Colombia (GMT-5)' },
			{ label: 'Shipping since', value: '2016' },
			{ label: 'Role', value: 'Senior FullStack Engineer' },
			{ label: 'Languages', value: 'Spanish (native) · English (C2)' },
			{ label: 'Focus', value: 'AI-assisted development' },
		],
		narrative: [
			'My first paid code shipped in 2016, at a small software studio in Cali, straight out of a game development program at SENA. Learning to program by making games left me with a conviction I never dropped: software people enjoy using is a feature, not a luxury.',
			'Since then I\'ve spent eight-plus years shipping for companies across the Americas. Real-time transaction services, group video calls, dashboards with drag-and-drop, delivery platforms. I went from engineer to senior in under two years at a consulting firm, and today I ship products for international clients as a Senior FullStack Engineer.',
			'I treated it like a faster autocomplete: vague prompt in, patch out, repeat. One session, a careless <code>git stash</code> ate eight of the ten files I\'d been working on, and I rebuilt them from memory. That week pushed me to specs, tests, and git worktrees — a workflow where the model understands the project before writing a line. The whole story is in <a href="/blog/tests-gave-me-control/">AI Gave Me Speed. Tests Gave Me Control.</a>',
			'This site is where I show that work. Every diagram in the posts is a live component you can poke (there are 30-plus of them in <a href="/lab/">the lab</a>), <a href="https://todo.valdemird.com">the todo app</a> I plan my days with is mine, and the workflow the blog describes is the same one this site is built with.',
		],
		pivotLine: 'I got AI wrong before I got it right.',
		pivotAfter: 1,
		now: {
			updatedDisplay: 'Updated June 2026',
			items: [
				'Finished my B.Eng. in Systems Engineering and the Claude Certified Architect exam, both this year.',
				'Building todo.valdemird.com — AI scheduling, Pomodoro, drag-and-drop.',
				'Exploring on-device AI in the browser. If your Chrome supports it, the chat button in the corner runs locally on your machine.',
				'Writing about interactive components and running Claude agents in parallel.',
			],
		},
		sections: {
			tech: 'What I work with',
			journey: 'Journey',
			now: 'Now',
			beliefs: 'What I believe in',
			proof: 'Background & credentials',
			contact: 'Get in touch',
			startHere: 'Start here',
		},
		techDomains: [
			{ domain: 'Frontend', tools: ['React', 'Next.js', 'Astro', 'TypeScript', 'CSS/Design Systems'], accent: ACCENT.frontend },
			{ domain: 'Backend', tools: ['Node.js', 'PostgreSQL', 'Prisma', 'REST APIs'], accent: ACCENT.backend },
			{ domain: 'DevOps & Cloud', tools: ['AWS (Certified)', 'CI/CD', 'Docker', 'GitHub Actions'], accent: ACCENT.devops },
			{ domain: 'AI & Tooling', tools: ['LLM Integration', 'Vercel AI SDK', 'Spec-Driven Development', 'Custom CLI Workflows'], accent: ACCENT.ai },
		],
		timeline: [
			{ year: '2022–Now', title: 'Senior FullStack Engineer', place: 'Nearshore Tech Company', desc: 'Products for international clients: React, Next.js, cloud infrastructure.', active: true },
			{ year: '2020–2022', title: 'Software Engineer → Senior', place: 'Software Consulting Firm', desc: 'Engineer to senior in under two years, across several client projects.', active: false },
			{ year: '2019–2020', title: 'Software Developer', place: 'Dev Agency', desc: 'Real-time transactional services, group video calls, PDF report generators.', active: false },
			{ year: '2017–2018', title: 'Freelance Engineer', place: 'Independent', desc: 'Android apps, Arduino IoT integrations, Firebase backends.', active: false },
			{ year: '2016–2017', title: 'Junior Developer', place: 'Software Studio', desc: 'First professional role. Where it all started.', active: false },
		],
		education: [
			{ name: 'B.Eng. Systems Engineering, Universidad del Valle', year: '2026' },
			{ name: 'Technology Degree in Information Systems, Universidad del Valle', year: '2018' },
			{ name: 'Technology Degree in Game Development, SENA', year: '2016' },
		],
		certs: CERTS,
		beliefs: [
			{ title: 'Spec-driven development', desc: 'Write the spec before the code. Let the LLM be your co-architect, not just your typist.', postSlug: 'custom-commands-ai-coding', linkLabel: 'I wrote about this →' },
			{ title: 'Build in public', desc: 'Share what you learn. The best way to solidify knowledge is to teach it.', postSlug: 'building-to-learn', linkLabel: 'I wrote about this →' },
			{ title: 'Beauty & function', desc: "Tools should be beautiful and functional. Design is part of the message, not a coat of paint.", postSlug: 'interactive-blog-components', linkLabel: 'I wrote about this →' },
		],
		featuredCert: {
			issuedDisplay: 'Anthropic Education · Issued June 5, 2026',
			verifyLabel: 'Verify credential →',
			blurb: 'Anthropic\'s formal certification on architecting with Claude. The exam version of what the posts here document in practice: specs, agents, and tooling.',
		},
		credentialEyebrow: 'Credential',
		closing: 'I live in Cali, Colombia. Outside client work I build small multiplayer games at <a href="https://games.valdemird.com">games.valdemird.com</a> and tweak this site\'s components more than I should. If you want to talk shop, the form above or any of these works.',
		startHere: [
			{ slug: 'tests-gave-me-control', title: 'AI Gave Me Speed. Tests Gave Me Control.' },
			{ slug: 'worktrees-let-me-parallelize', title: 'Git Worktrees Let Me Run Three Claude Agents in Parallel' },
			{ slug: 'interactive-blog-components', title: 'Interactive Blog Posts: Why I Built 30 Components Instead of Pasting Screenshots' },
		],
		labCta: 'Or browse every component live in the lab →',
	},
	es: {
		heroLabel: 'Sobre mí',
		identityLine: 'Construyo software y muestro mi trabajo.',
		heroMeta: 'Sebastian Castano Jara · Senior Software Engineer · Cali, Colombia',
		photoAlt: 'Retrato de Sebastian Castano Jara',
		quickFacts: [
			{ label: 'Base', value: 'Cali, Colombia (GMT-5)' },
			{ label: 'Programando desde', value: '2016' },
			{ label: 'Rol', value: 'Senior FullStack Engineer' },
			{ label: 'Idiomas', value: 'Español (nativo) · Inglés (C2)' },
			{ label: 'Foco', value: 'Desarrollo asistido por IA' },
		],
		narrative: [
			'Mi primer código pagado salió a producción en 2016, en un estudio pequeño de software en Cali, recién salido de un programa de desarrollo de videojuegos del SENA. Aprender a programar haciendo juegos me dejó una convicción que nunca solté: que el software se disfrute usar es una característica, no un lujo.',
			'Desde entonces llevo más de ocho años lanzando productos para empresas en las Américas. Servicios transaccionales en tiempo real, videollamadas grupales, dashboards con drag-and-drop, plataformas de delivery. Pasé de ingeniero a senior en menos de dos años en una consultora, y hoy construyo productos para clientes internacionales como Senior FullStack Engineer.',
			'La traté como un autocompletado más rápido: prompt vago, parche, repetir. En una sesión, un <code>git stash</code> descuidado se comió ocho de los diez archivos en los que venía trabajando, y los reconstruí de memoria. Esa semana me empujó hacia los specs, los tests y los git worktrees: un flujo donde el modelo entiende el proyecto antes de escribir una línea. La historia completa está en <a href="/blog/es/tests-gave-me-control/">La IA me dio velocidad. Los tests me dieron control.</a>',
			'Este sitio es donde muestro ese trabajo. Cada diagrama de los posts es un componente vivo que puedes tocar (hay más de 30 en <a href="/es/lab/">el lab</a>), <a href="https://todo.valdemird.com">la app de tareas</a> con la que planeo mis días es mía, y el flujo que describe el blog es el mismo con el que está construido este sitio.',
		],
		pivotLine: 'Me equivoqué con la IA antes de acertar con ella.',
		pivotAfter: 1,
		now: {
			updatedDisplay: 'Actualizado junio 2026',
			items: [
				'Terminé la Ingeniería de Sistemas y el examen de Claude Certified Architect, ambos este año.',
				'Construyendo todo.valdemird.com: planificación con IA, Pomodoro y drag-and-drop.',
				'Explorando IA on-device en el navegador. Si tu Chrome lo admite, el chat del botón de la esquina corre localmente en tu máquina.',
				'Escribiendo sobre componentes interactivos y agentes de Claude corriendo en paralelo.',
			],
		},
		sections: {
			tech: 'Con qué trabajo',
			journey: 'Trayectoria',
			now: 'Ahora',
			beliefs: 'En lo que creo',
			proof: 'Formación y credenciales',
			contact: 'Contacto',
			startHere: 'Empieza por aquí',
		},
		techDomains: [
			{ domain: 'Frontend', tools: ['React', 'Next.js', 'Astro', 'TypeScript', 'CSS/Design Systems'], accent: ACCENT.frontend },
			{ domain: 'Backend', tools: ['Node.js', 'PostgreSQL', 'Prisma', 'REST APIs'], accent: ACCENT.backend },
			{ domain: 'DevOps & Cloud', tools: ['AWS (Certificado)', 'CI/CD', 'Docker', 'GitHub Actions'], accent: ACCENT.devops },
			{ domain: 'IA & Tooling', tools: ['Integración de LLMs', 'Vercel AI SDK', 'Desarrollo spec-driven', 'Flujos CLI custom'], accent: ACCENT.ai },
		],
		timeline: [
			{ year: '2022–Ahora', title: 'Senior FullStack Engineer', place: 'Empresa Nearshore', desc: 'Productos para clientes internacionales: React, Next.js e infraestructura cloud.', active: true },
			{ year: '2020–2022', title: 'Software Engineer → Senior', place: 'Consultora de Software', desc: 'De ingeniero a senior en menos de dos años, en varios proyectos de clientes.', active: false },
			{ year: '2019–2020', title: 'Software Developer', place: 'Agencia Dev', desc: 'Servicios transaccionales en tiempo real, videollamadas grupales, generadores de reportes PDF.', active: false },
			{ year: '2017–2018', title: 'Freelance Engineer', place: 'Independiente', desc: 'Apps Android, integraciones IoT con Arduino, backends Firebase.', active: false },
			{ year: '2016–2017', title: 'Junior Developer', place: 'Estudio de Software', desc: 'Primer rol profesional. Donde empezó todo.', active: false },
		],
		education: [
			{ name: 'Ingeniero de Sistemas, Universidad del Valle', year: '2026' },
			{ name: 'Tecnólogo en Sistemas de Información, Universidad del Valle', year: '2018' },
			{ name: 'Tecnólogo en Desarrollo de Videojuegos, SENA', year: '2016' },
		],
		certs: CERTS,
		beliefs: [
			{ title: 'Desarrollo spec-driven', desc: 'Escribe el spec antes del código. Deja que el LLM sea tu coarquitecto, no solo tu mecanógrafo.', postSlug: 'custom-commands-ai-coding', linkLabel: 'Escribí sobre esto →' },
			{ title: 'Construir en público', desc: 'Comparte lo que aprendes. La mejor forma de solidificar el conocimiento es enseñarlo.', postSlug: 'building-to-learn', linkLabel: 'Escribí sobre esto →' },
			{ title: 'Belleza y función', desc: 'Las herramientas deben ser bonitas y funcionales. El diseño es parte del mensaje, no una capa de pintura.', postSlug: 'interactive-blog-components', linkLabel: 'Escribí sobre esto →' },
		],
		featuredCert: {
			issuedDisplay: 'Anthropic Education · Emitida el 5 de junio de 2026',
			verifyLabel: 'Verificar credencial →',
			blurb: 'La certificación formal de Anthropic sobre arquitectura con Claude. La versión con examen de lo que los posts de este blog documentan en la práctica: specs, agentes y tooling.',
		},
		credentialEyebrow: 'Credencial',
		closing: 'Vivo en Cali, Colombia. Fuera del trabajo con clientes construyo juegos multijugador pequeños en <a href="https://games.valdemird.com">games.valdemird.com</a> y ajusto los componentes de este sitio más de lo que debería. Si quieres hablar del oficio, sirve el formulario de arriba o cualquiera de estos.',
		startHere: [
			{ slug: 'tests-gave-me-control', title: 'La IA me dio velocidad. Los tests me dieron control.' },
			{ slug: 'worktrees-let-me-parallelize', title: 'Git worktrees: cómo corrí tres agentes de Claude en paralelo' },
			{ slug: 'interactive-blog-components', title: 'Posts interactivos: por qué construí 30 componentes en vez de pegar capturas' },
		],
		labCta: 'O recorre todos los componentes vivos en el lab →',
	},
};
