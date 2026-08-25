export type ProjectCopyBlock =
	| { type: 'paragraph'; text: string }
	| { type: 'list'; items: { title: string; body: string }[] };

function parseListItem(raw: string): { title: string; body: string } {
	const patterns = [
		/^\*\*(.+?):\*\*\s*([\s\S]*)$/, // **Title:** body
		/^\*\*(.+?)\*\*:\s*([\s\S]*)$/, // **Title**: body
		/^([^:]+):\s*([\s\S]*)$/, // Title: body
	];

	for (const pattern of patterns) {
		const match = raw.match(pattern);
		if (!match) continue;

		return {
			title: match[1].replace(/\*+/g, '').trim(),
			body: match[2].replace(/^\*+\s*/, '').trim(),
		};
	}

	return { title: '', body: raw.replace(/\*+/g, '').trim() };
}

/** Parse project section copy into paragraphs and `- **Title:** body` lists. */
export function parseProjectCopyBlocks(text: string): ProjectCopyBlock[] {
	return text
		.split(/\n\s*\n/)
		.map((part) => part.trim())
		.filter(Boolean)
		.map((chunk) => {
			const lines = chunk
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean);

			if (lines.length > 0 && lines.every((line) => /^[-*]\s+/.test(line))) {
				return {
					type: 'list' as const,
					items: lines.map((line) => parseListItem(line.replace(/^[-*]\s+/, ''))),
				};
			}

			return { type: 'paragraph' as const, text: chunk };
		});
}
