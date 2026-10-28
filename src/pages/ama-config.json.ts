import type { APIRoute } from 'astro';
import { ARTICLE_PROMPT, IMPROVE_PROMPT, INTENT_KEYWORDS, buildSystemPrompt } from '../data/ask-me-anything';

/**
 * Prompts for the AskMeAnything on-device chat, served as one static JSON file
 * (/ama-config.json) instead of being inlined into every page. The widget only
 * fetches it in browsers that actually expose the local model, so most
 * visitors never download it.
 */
const LOCALES = ['en', 'es'] as const;

export const GET: APIRoute = () => {
	const body = Object.fromEntries(
		LOCALES.map((lang) => [
			lang,
			{
				systemPrompt: buildSystemPrompt(lang),
				articlePrompt: ARTICLE_PROMPT[lang],
				improvePrompt: IMPROVE_PROMPT[lang],
				keywords: INTENT_KEYWORDS[lang],
			},
		]),
	);
	return new Response(JSON.stringify(body), {
		headers: { 'Content-Type': 'application/json; charset=utf-8' },
	});
};
