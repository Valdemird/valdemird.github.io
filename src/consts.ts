export const SITE_TITLE = 'valdemird';
export const SITE_DESCRIPTION = 'Software engineer, builder, and writer. Building tools that make developers more productive.';

export const SOCIAL_LINKS = {
	github: 'https://github.com/valdemird',
	twitter: '',
	linkedin: 'https://www.linkedin.com/in/sebastiancaja',
} as const;

export const PROJECTS = [
	{
		title: 'Todo App',
		description: 'A beautiful, AI-powered task manager with Pomodoro timer, drag-and-drop, and smart scheduling.',
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
			bio: 'I build tools that make developers more productive. Currently exploring the intersection of AI and developer experience.',
			projectsTitle: 'Projects',
			recentPostsTitle: 'Recent Posts',
			viewAllPosts: 'View all posts',
		},
		blog: {
			title: 'Blog',
			description: 'Thoughts on software engineering, AI tools, and building products.',
			readMore: 'Read more',
			minRead: 'min read',
		},
		about: {
			title: 'About Me',
			description: 'Learn more about me and what I do.',
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
			subtitle: 'Ingeniero de Software & Builder',
			bio: 'Construyo herramientas que hacen a los desarrolladores más productivos. Actualmente explorando la intersección entre IA y experiencia de desarrollo.',
			projectsTitle: 'Proyectos',
			recentPostsTitle: 'Posts Recientes',
			viewAllPosts: 'Ver todos los posts',
		},
		blog: {
			title: 'Blog',
			description: 'Reflexiones sobre ingeniería de software, herramientas de IA y construcción de productos.',
			readMore: 'Leer más',
			minRead: 'min de lectura',
		},
		about: {
			title: 'Sobre Mí',
			description: 'Conoce más sobre mí y lo que hago.',
		},
		footer: {
			copyright: 'Todos los derechos reservados.',
		},
	},
} as const;

export type Locale = keyof typeof UI_STRINGS;

export function getLocale(url: URL): Locale {
	return url.pathname.startsWith('/es') ? 'es' : 'en';
}

export function t(url: URL) {
	return UI_STRINGS[getLocale(url)];
}
