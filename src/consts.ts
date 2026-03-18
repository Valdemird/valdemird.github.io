export const SITE_TITLE = 'valdemird';
export const SITE_DESCRIPTION = 'Software engineer and builder. I make developer tools and write about what I learn.';

export const SOCIAL_LINKS = {
	github: 'https://github.com/valdemird',
	twitter: '',
	linkedin: 'https://www.linkedin.com/in/sebastiancaja',
} as const;

export const PROJECTS = [
	{
		title: 'Todo App',
		description: 'Task manager with AI scheduling, Pomodoro timer, and drag-and-drop. Built because every other todo app annoyed me.',
		url: 'https://todo.valdemird.com',
		tech: ['Next.js 15', 'React 19', 'Prisma', 'Tailwind CSS 4', 'Vercel AI SDK'],
	},
] as const;

// i18n UI strings
export const UI_STRINGS = {
	en: {
		nav: {
			home: 'Home',
			blog: 'Blog',
			about: 'About',
		},
		home: {
			greeting: "Hi, I'm",
			name: 'valdemird',
			subtitle: 'Software Engineer & Builder',
			bio: 'I build developer tools and side projects. Right now I\'m figuring out how to make AI actually useful in day-to-day coding.',
			projectsTitle: 'Projects',
			recentPostsTitle: 'Recent Posts',
			viewAllPosts: 'View all posts',
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
		},
		home: {
			greeting: 'Hola, soy',
			name: 'valdemird',
			subtitle: 'Ingeniero de Software & Maker',
			bio: 'Construyo herramientas para desarrolladores y side projects. Ahora mismo estoy buscando cómo hacer que la IA sea realmente útil en el día a día de programar.',
			projectsTitle: 'Proyectos',
			recentPostsTitle: 'Posts Recientes',
			viewAllPosts: 'Ver todos los posts',
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
