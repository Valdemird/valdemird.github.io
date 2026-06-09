/**
 * About page content, keyed by locale. Markup/styles/scripts live in
 * src/components/pages/AboutPage.astro — this module only holds the data,
 * sharing what is identical across locales (tech names, cert names, dates).
 */

export type AboutLocale = 'en' | 'es';

export type TechDomain = { domain: string; tools: readonly string[]; accent: string };
export type TimelineItem = { year: string; title: string; place: string; desc: string; active: boolean };
export type CredentialItem = { name: string; year: string };
export type Belief = { title: string; desc: string };

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
	/** Intro paragraphs — HTML strings (inline links), rendered with set:html. */
	intro: readonly string[];
	sections: { tech: string; journey: string; education: string; certs: string; beliefs: string; contact: string };
	techDomains: readonly TechDomain[];
	timeline: readonly TimelineItem[];
	education: readonly CredentialItem[];
	certs: readonly CredentialItem[];
	beliefs: readonly Belief[];
	/** "Languages I speak" line — HTML string. */
	langNote: string;
};

export const ABOUT_CONTENT: Record<AboutLocale, AboutContent> = {
	en: {
		heroLabel: 'About',
		intro: [
			"I'm a full-stack engineer with 8+ years building digital products. Currently working as a Senior FullStack Engineer, shipping products and untangling complex systems for companies across the Americas.",
			'Outside of work, I build side projects. My current one is <a href="https://todo.valdemird.com">todo.valdemird.com</a>, a task manager with AI scheduling, Pomodoro timer, and drag-and-drop. Built with Next.js 15, React 19, Prisma, and Tailwind CSS 4.',
			'I spend a lot of time thinking about how to make AI actually useful when coding. Not just as a code generator, but as something that understands your project before writing a single line. I built a spec-driven development workflow that I use daily and <a href="/blog/custom-commands-ai-coding/">write about on this blog</a>.',
		],
		sections: {
			tech: 'What I work with',
			journey: 'Journey',
			education: 'Education',
			certs: 'Certifications',
			beliefs: 'What I believe in',
			contact: 'Get in touch',
		},
		techDomains: [
			{ domain: 'Frontend', tools: ['React', 'Next.js', 'Astro', 'TypeScript', 'CSS/Design Systems'], accent: ACCENT.frontend },
			{ domain: 'Backend', tools: ['Node.js', 'PostgreSQL', 'Prisma', 'REST APIs'], accent: ACCENT.backend },
			{ domain: 'DevOps & Cloud', tools: ['AWS (Certified)', 'CI/CD', 'Docker', 'GitHub Actions'], accent: ACCENT.devops },
			{ domain: 'AI & Tooling', tools: ['LLM Integration', 'Vercel AI SDK', 'Spec-Driven Development', 'Custom CLI Workflows'], accent: ACCENT.ai },
		],
		timeline: [
			{ year: '2022–Now', title: 'Senior FullStack Engineer', place: 'Nearshore Tech Company', desc: 'Shipping digital products for international clients. React, Next.js, cloud infrastructure. 4+ years and counting.', active: true },
			{ year: '2020–2022', title: 'Software Engineer → Senior', place: 'Software Consulting Firm', desc: 'Went from Software Engineer to Senior in under 2 years. Full-stack work across multiple client projects.', active: false },
			{ year: '2019–2020', title: 'Software Developer', place: 'Dev Agency', desc: 'Real-time transactional services, group video calls, drag-and-drop dashboards, PDF report generators. React, Node.js, Firebase, AWS.', active: false },
			{ year: '2017–2018', title: 'Freelance Engineer', place: 'Independent', desc: 'Android apps, Arduino IoT integration, Firebase backends. Mobile apps and delivery platforms.', active: false },
			{ year: '2016–2017', title: 'Junior Developer', place: 'Software Studio', desc: 'First professional role. Where it all started.', active: false },
		],
		education: [
			{ name: 'B.Eng. Systems Engineering, Universidad del Valle', year: '2026' },
			{ name: 'Technology Degree in Information Systems, Universidad del Valle', year: '2018' },
			{ name: 'Technology Degree in Game Development, SENA', year: '2016' },
		],
		certs: CERTS,
		beliefs: [
			{ title: 'Spec-driven development', desc: 'Write the spec before the code. Let the LLM be your co-architect, not just your typist.' },
			{ title: 'Build in public', desc: 'Share what you learn. The best way to solidify knowledge is to teach it.' },
			{ title: 'Beauty & function', desc: "Tools should be beautiful AND functional. Design is not decoration, it's communication." },
		],
		langNote: 'I speak <strong>Spanish</strong> (native) and <strong>English</strong> (C2 proficient).',
	},
	es: {
		heroLabel: 'Sobre mí',
		intro: [
			'Soy ingeniero full-stack con 8+ años construyendo productos digitales. Actualmente trabajo como Senior FullStack Engineer, lanzando productos y desenredando sistemas complejos para empresas en las Américas.',
			'Fuera del trabajo, construyo side projects. El actual es <a href="https://todo.valdemird.com">todo.valdemird.com</a>, un gestor de tareas con planificación por IA, temporizador Pomodoro y drag-and-drop. Hecho con Next.js 15, React 19, Prisma y Tailwind CSS 4.',
			'Le dedico bastante tiempo a pensar cómo hacer que la IA sea realmente útil al programar. No solo como generador de código, sino como algo que entiende tu proyecto antes de escribir una sola línea. Creé un flujo de desarrollo spec-driven que uso a diario y sobre el cual <a href="/blog/es/custom-commands-ai-coding/">escribo en este blog</a>.',
		],
		sections: {
			tech: 'Con qué trabajo',
			journey: 'Trayectoria',
			education: 'Educación',
			certs: 'Certificaciones',
			beliefs: 'En lo que creo',
			contact: 'Contacto',
		},
		techDomains: [
			{ domain: 'Frontend', tools: ['React', 'Next.js', 'Astro', 'TypeScript', 'CSS/Design Systems'], accent: ACCENT.frontend },
			{ domain: 'Backend', tools: ['Node.js', 'PostgreSQL', 'Prisma', 'REST APIs'], accent: ACCENT.backend },
			{ domain: 'DevOps & Cloud', tools: ['AWS (Certificado)', 'CI/CD', 'Docker', 'GitHub Actions'], accent: ACCENT.devops },
			{ domain: 'IA & Tooling', tools: ['Integración de LLMs', 'Vercel AI SDK', 'Desarrollo spec-driven', 'Flujos CLI custom'], accent: ACCENT.ai },
		],
		timeline: [
			{ year: '2022–Ahora', title: 'Senior FullStack Engineer', place: 'Empresa Nearshore', desc: 'Lanzando productos digitales para clientes internacionales. React, Next.js e infraestructura cloud. 4+ años y contando.', active: true },
			{ year: '2020–2022', title: 'Software Engineer → Senior', place: 'Consultora de Software', desc: 'Pasé de Software Engineer a Senior en menos de 2 años. Desarrollo full-stack en múltiples proyectos de clientes.', active: false },
			{ year: '2019–2020', title: 'Software Developer', place: 'Agencia Dev', desc: 'Servicios transaccionales en tiempo real, videollamadas grupales, dashboards con drag-and-drop, generadores de reportes PDF. React, Node.js, Firebase, AWS.', active: false },
			{ year: '2017–2018', title: 'Freelance Engineer', place: 'Independiente', desc: 'Apps Android, integración IoT con Arduino, backends Firebase. Apps móviles y plataformas de delivery.', active: false },
			{ year: '2016–2017', title: 'Junior Developer', place: 'Estudio de Software', desc: 'Primer rol profesional. Donde empezó todo.', active: false },
		],
		education: [
			{ name: 'Ingeniero de Sistemas, Universidad del Valle', year: '2026' },
			{ name: 'Tecnólogo en Sistemas de Información, Universidad del Valle', year: '2018' },
			{ name: 'Tecnólogo en Desarrollo de Videojuegos, SENA', year: '2016' },
		],
		certs: CERTS,
		beliefs: [
			{ title: 'Desarrollo spec-driven', desc: 'Escribe el spec antes del código. Deja que el LLM sea tu coarquitecto, no solo tu mecanógrafo.' },
			{ title: 'Construir en público', desc: 'Comparte lo que aprendes. La mejor forma de solidificar el conocimiento es enseñarlo.' },
			{ title: 'Belleza y función', desc: 'Las herramientas deben ser hermosas Y funcionales. El diseño no es decoración — es comunicación.' },
		],
		langNote: 'Hablo <strong>español</strong> (nativo) e <strong>inglés</strong> (nivel C2).',
	},
};
