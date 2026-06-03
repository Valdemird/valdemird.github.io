export const SITE_TITLE = 'valdemird';
export const SITE_DESCRIPTION = 'Software engineer and builder. I make developer tools and write about what I learn.';
export const SITE_DESCRIPTION_ES = 'Ingeniero de software y maker. Construyo herramientas para desarrolladores y escribo sobre lo que aprendo.';

export const SOCIAL_LINKS = {
	github: 'https://github.com/valdemird',
	twitter: '',
	linkedin: 'https://www.linkedin.com/in/sebastiancaja',
} as const;

type Project = {
	readonly title: string;
	/** Localized description — title and tech stay shared (brand/tech names). */
	readonly description: { readonly en: string; readonly es: string };
	readonly url: string;
	readonly tech: readonly string[];
	/** Optional screenshot path (e.g. /images/projects/<slug>.webp). When omitted, the card renders a wireframe fallback. */
	readonly thumbnail?: string;
};

export const PROJECTS: readonly Project[] = [
	{
		title: 'Todo App',
		description: {
			en: 'Task manager with AI scheduling, Pomodoro timer, and drag-and-drop. Built because every other todo app annoyed me.',
			es: 'Gestor de tareas con planificación por IA, temporizador Pomodoro y drag-and-drop. Lo construí porque las demás apps de tareas me molestaban.',
		},
		url: 'https://todo.valdemird.com',
		tech: ['Next.js 15', 'React 19', 'Prisma', 'Tailwind CSS 4', 'Vercel AI SDK'],
		thumbnail: '/images/projects/todo.webp',
	},
];

// Games & interactive experiments — a playground separate from the "real" projects.
export const EXPERIMENTS: readonly Project[] = [
	{
		title: 'valdemird.games',
		description: {
			en: 'A space to explore games and interactive experiences. Real-time multiplayer rooms — drop in two players and race. First up: Caza Números.',
			es: 'Un espacio para explorar juegos y experiencias interactivas. Salas multijugador en tiempo real: entran dos jugadores y compiten. Lo primero: Caza Números.',
		},
		url: 'https://games.valdemird.com',
		tech: ['React', 'Vite', 'TypeScript', 'Socket.IO', 'Vitest'],
		thumbnail: '/images/projects/games.webp',
	},
];

// i18n UI strings
export const UI_STRINGS = {
	en: {
		nav: {
			home: 'Home',
			blog: 'Blog',
			about: 'About',
			switchLang: 'Switch to',
			toggleMenu: 'Toggle menu',
		},
		home: {
			greeting: "Hi, I'm",
			name: 'valdemird',
			subtitle: 'Software Engineer & Builder',
			bio: 'I build developer tools and side projects. Right now I\'m figuring out how to make AI actually useful in day-to-day coding.',
			statusBadge: "Let's talk, learn, and build",
			metaDescription: 'Software engineer and builder. I make developer tools and write about what I learn.',
			projectsTitle: 'Projects',
			gamesTitle: 'Games & Experiments',
			recentPostsTitle: 'Recent Posts',
			viewAllPosts: 'View all posts',
		},
		projects: {
			previewOf: 'Preview of',
		},
		blog: {
			title: 'Blog',
			description: 'Writing about software, AI tools, and things I\'ve learned building products.',
			readMore: 'Read more',
			minRead: 'min read',
		},
		about: {
			title: 'About Me',
			description: 'Full-stack engineer with 8+ years shipping products with React, Next.js, and Node.js. Currently building developer tools and experimenting with AI workflows.',
		},
		footer: {
			copyright: 'All rights reserved.',
		},
	},
	es: {
		nav: {
			home: 'Inicio',
			blog: 'Blog',
			about: 'Acerca',
			switchLang: 'Cambiar a',
			toggleMenu: 'Alternar menú',
		},
		home: {
			greeting: 'Hola, soy',
			name: 'valdemird',
			subtitle: 'Ingeniero de Software & Maker',
			bio: 'Construyo herramientas para desarrolladores y side projects. Ahora mismo estoy buscando cómo hacer que la IA sea realmente útil en el día a día de programar.',
			statusBadge: 'Hablemos, aprendamos y construyamos',
			metaDescription: 'Ingeniero de software y maker. Construyo herramientas para desarrolladores y escribo sobre lo que aprendo.',
			projectsTitle: 'Proyectos',
			gamesTitle: 'Juegos & Experimentos',
			recentPostsTitle: 'Posts Recientes',
			viewAllPosts: 'Ver todos los posts',
		},
		projects: {
			previewOf: 'Vista previa de',
		},
		blog: {
			title: 'Blog',
			description: 'Sobre software, herramientas de IA y cosas que he aprendido construyendo productos.',
			readMore: 'Leer más',
			minRead: 'min de lectura',
		},
		about: {
			title: 'Sobre Mí',
			description: 'Ingeniero full-stack con 8+ años creando productos con React, Next.js y Node.js. Construyendo herramientas para desarrolladores y experimentando con flujos de trabajo con IA.',
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
