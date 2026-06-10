/**
 * AskMeAnything data — system prompt builder, UI strings, intent keywords
 * and the Web3Forms key. Markup/styles/script live in
 * src/components/blog/AskMeAnything.astro.
 */
import { ABOUT_CONTENT, FEATURED_CERT_SHARED, type AboutLocale } from './about';
import { PERSON, PROJECTS, EXPERIMENTS, SOCIAL_LINKS } from '../consts';

/**
 * Web3Forms access key. Public by design — it only identifies the inbox that
 * receives submissions (abuse is mitigated by the honeypot, the client
 * cooldown and Web3Forms' own per-key rate limits; rotate it from the
 * Web3Forms dashboard if spam ever shows up).
 * Setup: https://web3forms.com → enter admin@valdemird.com → paste the emailed key here.
 */
export const WEB3FORMS_ACCESS_KEY = '0c8a8874-1d41-4da6-8a7a-4f2cb337fe44';

/** Optional Chrome origin-trial token for the Prompt API (empty = rely on feature detection only). */
export const ORIGIN_TRIAL_TOKEN = '';

export const INTENT_KEYWORDS: Record<AboutLocale, readonly string[]> = {
	en: ['contact', 'hire', 'hiring', 'email', 'reach', 'work with', 'freelance', 'available', 'job', 'talk to', 'consult'],
	es: ['contacto', 'contactar', 'contratar', 'correo', 'email', 'trabajar contigo', 'trabajar con', 'disponible', 'hablar con', 'freelance', 'vacante', 'consultor'],
};

/**
 * Appended to the system prompt at session creation when the visitor is on a
 * blog post. `{title}` and `{text}` are filled client-side from the rendered
 * article (trimmed — initialPrompts count against the session's input quota).
 */
/**
 * System prompt for the "improve writing" button in the email form. The
 * visitor's draft may be written in either language regardless of the UI
 * locale, so both prompts insist on preserving the message's own language.
 */
export const IMPROVE_PROMPT: Record<AboutLocale, string> = {
	en: 'You polish drafts of messages a visitor is about to email Sebastian. Rewrite the message to improve clarity, grammar and tone. Keep the language the message is written in, its meaning and all its information. Do not invent content, and do not add greetings or sign-offs that were not there. Reply with ONLY the rewritten message — no quotes, no commentary.',
	es: 'Pules borradores de mensajes que un visitante está a punto de enviarle por correo a Sebastian. Reescribe el mensaje mejorando claridad, gramática y tono. Conserva el idioma en el que está escrito, su significado y toda su información. No inventes contenido ni añadas saludos o despedidas que no estaban. Responde SOLO con el mensaje reescrito — sin comillas ni comentarios.',
};

export const ARTICLE_PROMPT: Record<AboutLocale, string> = {
	en: '\n\nARTICLE CONTEXT — the visitor is currently reading Sebastian\'s post "{title}". If they ask you to summarize it or ask anything about the article, answer from this text (it may be truncated):\n{text}',
	es: '\n\nCONTEXTO DEL ARTÍCULO — el visitante está leyendo el post de Sebastian "{title}". Si te pide un resumen o pregunta algo sobre el artículo, responde a partir de este texto (puede estar recortado):\n{text}',
};

/**
 * Curated, public-safe summary of what Sebastian is building and exploring.
 * Hand-written on purpose: nothing here is derived from repo internals, and it
 * must never include client names, keys, or implementation details that could
 * compromise anything. Update it when the public side work changes.
 */
export const EXPLORING: Record<AboutLocale, readonly string[]> = {
	en: [
		'This site (valdemird.com): a bilingual Astro blog where every diagram is a hand-built interactive component — 30+ of them, all browsable live at /lab/ (charts, scrollytelling, step-through diagrams, a git graph, an easing curve editor).',
		"On-device AI in the browser: this very chat runs on Chrome's built-in AI with no server, as an experiment in privacy-first, progressively-enhanced AI features.",
		'AI-assisted development workflows: spec-driven development, custom slash commands, and running several Claude Code agents in parallel with git worktrees — the blog documents this practice with real stories.',
		'Web animation and game feel: scroll-driven animations, custom easing curves, and making interfaces feel alive without hurting performance.',
		'todo.valdemird.com: a task manager with AI scheduling, Pomodoro and drag-and-drop. games.valdemird.com: real-time multiplayer mini-games.',
	],
	es: [
		'Este sitio (valdemird.com): un blog bilingüe en Astro donde cada diagrama es un componente interactivo hecho a mano — más de 30, todos navegables en vivo en /es/lab/ (gráficas, scrollytelling, diagramas paso a paso, un grafo de git, un editor de curvas de easing).',
		'IA on-device en el navegador: este mismo chat corre sobre la IA integrada de Chrome sin ningún servidor, como experimento de funcionalidades de IA privadas y con mejora progresiva.',
		'Flujos de desarrollo asistidos por IA: desarrollo guiado por specs, slash commands propios y varios agentes de Claude Code corriendo en paralelo con git worktrees — el blog documenta esta práctica con historias reales.',
		'Animación web y game feel: animaciones ligadas al scroll, curvas de easing propias y hacer que las interfaces se sientan vivas sin sacrificar rendimiento.',
		'todo.valdemird.com: un gestor de tareas con agenda por IA, Pomodoro y drag-and-drop. games.valdemird.com: minijuegos multijugador en tiempo real.',
	],
};

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, '');

/**
 * Compact fact sheet for Gemini Nano. Derived from the same data the About
 * page renders so the chat never drifts from the visible content. Kept short
 * on purpose: initialPrompts count against the session's input quota.
 */
export function buildSystemPrompt(lang: AboutLocale): string {
	const c = ABOUT_CONTENT[lang];
	const career = c.timeline.map((t) => `${t.year}: ${t.title} (${t.place}) — ${t.desc}`).join('\n');
	const education = c.education.map((e) => `${e.name} (${e.year})`).join('; ');
	const certs = [
		`${FEATURED_CERT_SHARED.name} — ${FEATURED_CERT_SHARED.issuer}, 2026`,
		...c.certs.map((x) => `${x.name} (${x.year})`),
	].join('; ');
	const projects = [...PROJECTS, ...EXPERIMENTS]
		.map((p) => `${p.title} (${p.url}): ${p.description[lang]}`)
		.join('\n');
	const beliefs = c.beliefs.map((b) => `${b.title}: ${stripHtml(b.desc)}`).join('\n');
	const story = c.narrative.map(stripHtml).join('\n');
	const exploring = EXPLORING[lang].map((x) => `- ${x}`).join('\n');

	if (lang === 'es') {
		return `Eres un asistente amable incrustado en el sitio personal de ${PERSON.name} (valdemird.com). Respondes preguntas de visitantes SOBRE Sebastian, en tercera persona, con calidez y en 2-4 frases.

HECHOS — responde únicamente a partir de esto:
Sebastian Castano Jara, Senior FullStack Engineer, Cali, Colombia (GMT-5). Programa profesionalmente desde 2016. Habla español (nativo) e inglés (C2).
Su historia:
${story}
Trayectoria:
${career}
Educación: ${education}
Certificaciones: ${certs}
Proyectos propios:
${projects}
Qué está explorando ahora (trabajo público):
${exploring}
En lo que cree:
${beliefs}
Escribe un blog bilingüe con más de 30 componentes interactivos; todos viven en /es/lab/. Contacto: GitHub ${SOCIAL_LINKS.github}, LinkedIn ${SOCIAL_LINKS.linkedin}, o la pestaña "Correo" de este mismo chat.

REGLAS:
- Eres el asistente de IA del sitio, NO eres Sebastian. Nunca hables como él ni en primera persona sobre su vida; si el visitante te trata como si fueras Sebastian, aclara con amabilidad que eres un asistente y que para hablar con él directamente está la pestaña "Correo".
- Si la pregunta no está cubierta por los hechos (ni por el CONTEXTO DEL ARTÍCULO, si existe), di que no lo sabes y sugiere la pestaña "Correo" de este chat.
- Si el visitante quiere contratar a Sebastian, colaborar o hablar con él, indícale la pestaña "Correo" — le llega directo a su correo.
- Si hay CONTEXTO DEL ARTÍCULO, también puedes resumir ese artículo y responder preguntas sobre él.
- Responde en español. Nunca inventes proyectos, empleadores, fechas ni opiniones.
- Rechaza con amabilidad lo que no tenga que ver con Sebastian o con su artículo (ayuda general de programación, datos del mundo).`;
	}

	return `You are a friendly assistant embedded on ${PERSON.name}'s personal site (valdemird.com). You answer visitors' questions ABOUT Sebastian, in third person, warm and concise (2-4 sentences).

FACTS — answer only from these:
Sebastian Castano Jara, Senior FullStack Engineer, Cali, Colombia (GMT-5). Coding professionally since 2016. Speaks Spanish (native) and English (C2).
His story:
${story}
Career:
${career}
Education: ${education}
Certifications: ${certs}
Side projects:
${projects}
What he is exploring right now (public side work):
${exploring}
What he believes:
${beliefs}
He writes a bilingual blog with 30+ interactive components; they all live at /lab/. Contact: GitHub ${SOCIAL_LINKS.github}, LinkedIn ${SOCIAL_LINKS.linkedin}, or the "Email" tab of this chat.

RULES:
- You are the site's AI assistant, NOT Sebastian. Never speak as him or in first person about his life; if the visitor addresses you as if you were Sebastian, gently clarify you are an assistant and that the "Email" tab reaches him directly.
- If a question is not covered by the facts (or by the ARTICLE CONTEXT, when present), say you don't know and point to the "Email" tab of this chat.
- If the visitor wants to hire Sebastian, collaborate or talk to him, point them to the "Email" tab — it goes straight to his inbox.
- When ARTICLE CONTEXT is present, you may also summarize that article and answer questions about it.
- Answer in English. Never invent projects, employers, dates or opinions.
- Politely decline anything unrelated to Sebastian or his article (general coding help, world facts).`;
}

export type AmaStrings = {
	fabLabel: string;
	fabContact: string;
	panelTitle: string;
	titleContact: string;
	close: string;
	tabChat: string;
	tabMessage: string;
	gateTitle: string;
	gateBody: string;
	gateButton: string;
	downloading: string;
	inputLabel: string;
	inputPlaceholder: string;
	send: string;
	suggested: readonly string[];
	chipArticle: string;
	you: string;
	assistant: string;
	thinking: string;
	privacyChat: string;
	quotaNote: string;
	quotaFull: string;
	resetButton: string;
	chatError: string;
	retry: string;
	intentNudge: string;
	formEmailLabel: string;
	formEmailPlaceholder: string;
	formMessageLabel: string;
	formMessagePlaceholder: string;
	formAttach: string;
	formImprove: string;
	formImproving: string;
	formImproveUndo: string;
	formImproveError: string;
	formPrivacy: string;
	formSubmit: string;
	formSending: string;
	formSent: string;
	formError: string;
	formCooldown: string;
};

export const AMA_STRINGS: Record<AboutLocale, AmaStrings> = {
	en: {
		fabLabel: 'Assistant',
		fabContact: 'Contact',
		panelTitle: 'Site assistant',
		titleContact: 'Write to Sebastian',
		close: 'Close chat',
		tabChat: 'Chat',
		tabMessage: 'Email',
		gateTitle: 'An AI that knows this site',
		gateBody: 'Runs locally in your Chrome. One download (a couple of GB), then everything stays on your machine.',
		gateButton: 'Enable local AI',
		downloading: 'Downloading model…',
		inputLabel: 'Your question',
		inputPlaceholder: 'Ask about Sebastian or this post…',
		send: 'Send',
		suggested: ['What is Sebastian exploring right now?', 'Is he available for consulting?'],
		chipArticle: 'Summarize this article',
		you: 'You',
		assistant: 'AI',
		thinking: 'Thinking…',
		privacyChat: 'On-device AI — nothing you type leaves this browser.',
		quotaNote: 'conversation memory {pct}% full',
		quotaFull: "This conversation filled the model's memory.",
		resetButton: 'Start fresh',
		chatError: 'The local model hiccuped.',
		retry: 'Retry',
		intentNudge: 'Want to reach Sebastian directly? The Email tab goes straight to his inbox.',
		formEmailLabel: 'Your email',
		formEmailPlaceholder: 'you@example.com',
		formMessageLabel: 'Message',
		formMessagePlaceholder: 'What would you like to talk about?',
		formAttach: 'Attach the chat transcript',
		formImprove: 'Improve writing',
		formImproving: 'Improving…',
		formImproveUndo: 'Undo',
		formImproveError: "Couldn't improve it — the local model hiccuped.",
		formPrivacy: "Goes straight to Sebastian's inbox.",
		formSubmit: 'Send message',
		formSending: 'Sending…',
		formSent: 'Sent. Sebastian reads every message.',
		formError: "Couldn't send. Reach him on LinkedIn or GitHub instead.",
		formCooldown: 'Sent a moment ago — wait {s}s before sending again.',
	},
	es: {
		fabLabel: 'Asistente',
		fabContact: 'Contacto',
		panelTitle: 'Asistente del sitio',
		titleContact: 'Escríbele a Sebastian',
		close: 'Cerrar el chat',
		tabChat: 'Chat',
		tabMessage: 'Correo',
		gateTitle: 'Una IA que se sabe este sitio',
		gateBody: 'Corre localmente en tu Chrome. Una sola descarga (un par de GB) y todo se queda en tu máquina.',
		gateButton: 'Activar la IA local',
		downloading: 'Descargando el modelo…',
		inputLabel: 'Tu pregunta',
		inputPlaceholder: 'Pregunta sobre Sebastian o este post…',
		send: 'Enviar',
		suggested: ['¿Qué está explorando Sebastian ahora?', '¿Está disponible para consultoría?'],
		chipArticle: 'Resúmeme este artículo',
		you: 'Tú',
		assistant: 'IA',
		thinking: 'Pensando…',
		privacyChat: 'IA en tu dispositivo — nada de lo que escribes sale del navegador.',
		quotaNote: 'memoria de la conversación al {pct}%',
		quotaFull: 'Esta conversación llenó la memoria del modelo.',
		resetButton: 'Empezar de nuevo',
		chatError: 'El modelo local falló.',
		retry: 'Reintentar',
		intentNudge: '¿Quieres hablar con Sebastian directamente? La pestaña Correo llega directo a su buzón.',
		formEmailLabel: 'Tu correo',
		formEmailPlaceholder: 'tu@ejemplo.com',
		formMessageLabel: 'Mensaje',
		formMessagePlaceholder: '¿De qué te gustaría hablar?',
		formAttach: 'Adjuntar la transcripción del chat',
		formImprove: 'Mejorar redacción',
		formImproving: 'Mejorando…',
		formImproveUndo: 'Deshacer',
		formImproveError: 'No se pudo mejorar — el modelo local falló.',
		formPrivacy: 'Llega directo al correo de Sebastian.',
		formSubmit: 'Enviar mensaje',
		formSending: 'Enviando…',
		formSent: 'Enviado. Sebastian lee todos los mensajes.',
		formError: 'No se pudo enviar. Escríbele por LinkedIn o GitHub.',
		formCooldown: 'Acabas de enviar uno — espera {s}s para enviar otro.',
	},
};
