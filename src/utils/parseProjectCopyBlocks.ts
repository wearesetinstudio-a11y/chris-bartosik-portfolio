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
	const lines = String(text || '')
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n')
		.split('\n');

	const blocks: ProjectCopyBlock[] = [];
	let paragraphLines: string[] = [];
	let listItems: { title: string; body: string }[] = [];

	const flushParagraph = () => {
		const value = paragraphLines.join('\n').trim();
		if (value) blocks.push({ type: 'paragraph', text: value });
		paragraphLines = [];
	};

	const flushList = () => {
		if (listItems.length > 0) blocks.push({ type: 'list', items: listItems });
		listItems = [];
	};

	for (const raw of lines) {
		const line = raw.trim();

		if (!line) {
			// Blank lines separate paragraphs; keep a list open so `- a\n\n- b` stays one list.
			if (listItems.length > 0) continue;
			flushParagraph();
			continue;
		}

		if (/^[-*]\s+/.test(line)) {
			flushParagraph();
			listItems.push(parseListItem(line.replace(/^[-*]\s+/, '')));
			continue;
		}

		flushList();
		paragraphLines.push(line);
	}

	flushParagraph();
	flushList();
	return blocks;
}
