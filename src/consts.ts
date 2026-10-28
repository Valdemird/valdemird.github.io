export const SITE_TITLE = 'valdemird';
export const SITE_DESCRIPTION = 'Software engineer and builder. I make developer tools and write about what I learn.';
export const SITE_DESCRIPTION_ES = 'Ingeniero de software y maker. Construyo herramientas para desarrolladores y escribo sobre lo que aprendo.';

export const SOCIAL_LINKS = {
	github: 'https://github.com/valdemird',
	twitter: '',
	linkedin: 'https://www.linkedin.com/in/sebastiancaja',
	devto: 'https://dev.to/valdemird',
} as const;

// --- Canonical author entity (Entity SEO / E-E-A-T) ---
// One stable @id reused across every page so the knowledge graph resolves a
// SINGLE person instead of a fresh anonymous node per post. Canonical name is
// the real name; "Valdemir D." is the pen name carried as alternateName, and
// both profiles live in sameAs so they collapse to one entity.
export const PERSON_ID = 'https://valdemird.com/about/#person';

export const PERSON = {
	'@type': 'Person',
	'@id': PERSON_ID,
	name: 'Sebastian Castano',
	alternateName: ['Sebastian Castano Jara', 'Valdemir D.'],
	url: 'https://valdemird.com/about/',
	jobTitle: 'Senior Software Engineer & Consultant',
	knowsAbout: ['Software Engineering', 'Developer Tools', 'AI-assisted development', 'Astro', 'React', 'Web Performance'],
	sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.devto],
	image: 'https://valdemird.com/images/about/sebastian.webp',
} as const;

// Lightweight reference: link to the canonical Person by @id without re-inlining.
export const PERSON_REF = { '@id': PERSON_ID } as const;

// --- Publisher entity ---
// Article/BlogPosting structured data expects an Organization publisher with a
// logo. For this one-person brand the Organization is the site itself; the
// Person is its founder/author. One stable @id so it resolves to a single node.
export const ORGANIZATION_ID = 'https://valdemird.com/#organization';

export const ORGANIZATION = {
	'@type': 'Organization',
	'@id': ORGANIZATION_ID,
	name: SITE_TITLE,
	url: 'https://valdemird.com',
	logo: { '@type': 'ImageObject', url: 'https://valdemird.com/favicon.svg' },
	founder: { '@id': PERSON_ID },
	sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.devto],
} as const;

export const ORGANIZATION_REF = { '@id': ORGANIZATION_ID } as const;

// i18n UI strings
export const UI_STRINGS = {
	en: {
		nav: {
			home: 'Home',
			blog: 'Blog',
			about: 'About',
			lab: 'Lab',
			learn: 'Learn',
			switchLang: 'Switch to',
			toggleMenu: 'Toggle menu',
			skipToContent: 'Skip to content',
		},
		home: {
			greeting: "Hi, I'm",
			name: 'valdemird',
			subtitle: 'Software engineer & builder',
			bio: 'I ship products for companies across the Americas. After hours I build my own tools and write down what breaks. This site is me showing my work.',
			statusBadge: "Let's talk, learn, and build",
			metaDescription: 'Software engineer and builder. I make developer tools and write about what I learn.',
			recentPostsTitle: 'Recent posts',
			viewAllPosts: 'View all posts',
			terminalTitle: '~/valdemird',
		},
		blog: {
			title: 'Blog',
			description: 'Writing about software, AI tools, and things I\'ve learned building products.',
			readMore: 'Read more',
			minRead: 'min read',
			readNext: 'Read next',
			followEyebrow: 'Written by',
			followBio: 'Full-stack engineer in Cali, Colombia. I write about the tools and habits I use to ship software.',
			followAbout: 'More about me',
			followRss: 'Follow via RSS',
		},
		about: {
			title: 'About me',
			description: 'Sebastian Castano, full-stack engineer in Cali, Colombia. 8+ years shipping products, a spec-driven AI workflow, and a site built from its own live components.',
		},
		footer: {
			copyright: 'All rights reserved.',
		},
	},
	es: {
		nav: {
			home: 'Inicio',
			blog: 'Blog',
			about: 'Sobre mí',
			lab: 'Lab',
			learn: 'Aprende',
			switchLang: 'Cambiar a',
			toggleMenu: 'Abrir o cerrar el menú',
			skipToContent: 'Saltar al contenido',
		},
		home: {
			greeting: 'Hola, soy',
			name: 'valdemird',
			subtitle: 'Ingeniero de software y maker',
			bio: 'Lanzo productos para empresas en las Américas. Fuera del horario construyo mis propias herramientas y anoto lo que se rompe en el camino. Este sitio es mi manera de mostrar mi trabajo.',
			statusBadge: 'Hablemos, aprendamos y construyamos',
			metaDescription: 'Ingeniero de software y maker. Construyo herramientas para desarrolladores y escribo sobre lo que aprendo.',
			recentPostsTitle: 'Posts recientes',
			viewAllPosts: 'Ver todos los posts',
			terminalTitle: '~/valdemird',
		},
		blog: {
			title: 'Blog',
			description: 'Sobre software, herramientas de IA y cosas que he aprendido construyendo productos.',
			readMore: 'Leer más',
			minRead: 'min de lectura',
			readNext: 'Sigue leyendo',
			followEyebrow: 'Escrito por',
			followBio: 'Ingeniero full-stack en Cali, Colombia. Escribo sobre las herramientas y los hábitos que uso para construir software.',
			followAbout: 'Más sobre mí',
			followRss: 'Seguir por RSS',
		},
		about: {
			title: 'Sobre mí',
			description: 'Sebastian Castano, ingeniero full-stack en Cali, Colombia. Más de 8 años lanzando productos, un flujo de IA spec-driven y un sitio construido con sus propios componentes vivos.',
		},
		footer: {
			copyright: 'Todos los derechos reservados.',
		},
	},
} as const;

export type Locale = keyof typeof UI_STRINGS;

export function getLocale(url: URL): Locale {
	// Check both /es/ prefix (regular pages) and /blog/es/ (blog posts with es/ in content id)
	return url.pathname.startsWith('/es') || /^\/blog\/es\//.test(url.pathname) ? 'es' : 'en';
}

export function t(url: URL) {
	return UI_STRINGS[getLocale(url)];
}
