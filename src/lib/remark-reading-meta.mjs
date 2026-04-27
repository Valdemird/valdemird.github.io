import { visit } from 'unist-util-visit';

const WORDS_PER_MINUTE = 220;

function countWordsInText(text) {
	if (!text) return 0;
	return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * remark plugin: counts words across prose (text nodes + inline code)
 * and injects `wordCount` and `readingTime` (in minutes) into the
 * Astro frontmatter so layouts can read them from `post.data`.
 *
 * Ignores: nothing — we count inline code intentionally since it often
 * carries real words; headings/lists contribute naturally.
 */
export function remarkReadingMeta() {
	return function transformer(tree, file) {
		let wordCount = 0;

		visit(tree, (node) => {
			if (node.type === 'text' || node.type === 'inlineCode') {
				wordCount += countWordsInText(node.value);
			}
		});

		const readingTime = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));

		const data = (file.data ??= {});
		const astroData = (data.astro ??= {});
		const frontmatter = (astroData.frontmatter ??= {});
		frontmatter.wordCount = wordCount;
		frontmatter.readingTime = readingTime;
	};
}
