/**
 * Minimal ambient types for Chrome's built-in AI (Prompt API / Gemini Nano).
 * Covers only the surface AskMeAnything.astro calls — intentionally NOT the
 * full @types/dom-chromium-ai package, which tracks an unstable spec and
 * could break `astro check` on update. Always feature-detect at runtime:
 * the global may be absent everywhere except recent Chrome.
 */

type LanguageModelAvailability = 'available' | 'downloadable' | 'downloading' | 'unavailable';

interface LanguageModelMonitor extends EventTarget {
	addEventListener(type: 'downloadprogress', listener: (e: ProgressEvent) => void): void;
}

interface LanguageModelPromptMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface LanguageModelCreateOptions {
	initialPrompts?: LanguageModelPromptMessage[];
	monitor?: (m: LanguageModelMonitor) => void;
	signal?: AbortSignal;
}

interface LanguageModelSession {
	prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
	promptStreaming(input: string, options?: { signal?: AbortSignal }): AsyncIterable<string>;
	readonly inputUsage?: number;
	readonly inputQuota?: number;
	destroy(): void;
}

interface LanguageModelStatic {
	availability(): Promise<LanguageModelAvailability>;
	create(options?: LanguageModelCreateOptions): Promise<LanguageModelSession>;
}

// The global may not exist — always check `typeof LanguageModel === 'undefined'`.
declare var LanguageModel: LanguageModelStatic | undefined;
