/**
 * bib2yaml.ts — Convert BibTeX entries to YAML publication files.
 * Usage: npx tsx scripts/bib2yaml.ts
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { stringify } from 'yaml';
import { join } from 'path';

const BIB_PATH = '/Users/guillaume/Documents/Recherche/Resume-Simple/cv/references.bib';
const OUT_DIR = join(import.meta.dirname ?? '.', '..', 'content', 'publications');

interface BibEntry {
	type: string;
	key: string;
	fields: Record<string, string>;
}

function cleanLatex(s: string): string {
	const accentMap: Record<string, Record<string, string>> = {
		"'": { e: 'é', a: 'à', i: 'í', o: 'ó', u: 'ú', E: 'É', A: 'À' },
		'`': { e: 'è', a: 'à', u: 'ù', E: 'È', A: 'À' },
		'^': { e: 'ê', a: 'â', i: 'î', o: 'ô', u: 'û', E: 'Ê', I: 'Î' },
		'"': { e: 'ë', i: 'ï', o: 'ö', u: 'ü', a: 'ä' },
		'~': { n: 'ñ', a: 'ã', o: 'õ' },
		'c': { c: 'ç', C: 'Ç' },
	};
	return s
		// \^{\i} or \^{i} or \'{e} — LaTeX accents with braces (handle \i = dotless i)
		.replace(/\\(['^`"~c])\{\\i\}/g, (_, acc) => accentMap[acc]?.['i'] ?? 'i')
		.replace(/\\(['^`"~c])\{(\w)\}/g, (_, acc, ch) => accentMap[acc]?.[ch] ?? ch)
		// \^\i or \^i or \'e — LaTeX accents without braces (handle \i = dotless i)
		.replace(/\\(['^`"~c])\\i/g, (_, acc) => accentMap[acc]?.['i'] ?? 'i')
		.replace(/\\(['^`"~c])(\w)/g, (_, acc, ch) => accentMap[acc]?.[ch] ?? ch)
		.replace(/[{}]/g, '')
		.replace(/\\&/g, '&')
		.replace(/\\\\/g, '')
		.replace(/~/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function parseAuthors(raw: string): string[] {
	return raw
		.split(/\s+and\s+/i)
		.map((a) => cleanLatex(a).trim())
		.filter(Boolean);
}

function parseBib(content: string): BibEntry[] {
	const entries: BibEntry[] = [];
	// Match @type{key, ... } allowing nested braces in field values
	const entryRegex = /@(\w+)\s*\{([^,]+),/g;
	let match: RegExpExecArray | null;

	while ((match = entryRegex.exec(content)) !== null) {
		const type = match[1].toLowerCase();
		const key = match[2].trim();

		// Find the body of this entry by counting braces
		const startIdx = match.index + match[0].length;
		let depth = 1;
		let i = startIdx;
		while (i < content.length && depth > 0) {
			if (content[i] === '{') depth++;
			else if (content[i] === '}') depth--;
			i++;
		}
		const body = content.slice(startIdx, i - 1);

		// Parse fields: name = {value} or name = "value" or name = number
		const fields: Record<string, string> = {};
		const fieldRegex = /(\w+)\s*=\s*(?:\{((?:[^{}]|\{[^{}]*\})*)\}|"([^"]*)"|(\d+))/g;
		let fm: RegExpExecArray | null;
		while ((fm = fieldRegex.exec(body)) !== null) {
			const fieldName = fm[1].toLowerCase();
			const fieldValue = fm[2] ?? fm[3] ?? fm[4] ?? '';
			fields[fieldName] = fieldValue;
		}

		entries.push({ type, key, fields });
	}

	return entries;
}

function mapType(bibType: string): 'article' | 'inproceedings' | 'patent' | 'misc' {
	if (bibType === 'article') return 'article';
	if (bibType === 'inproceedings' || bibType === 'conference') return 'inproceedings';
	if (bibType === 'patent') return 'patent';
	return 'misc';
}

function toYaml(entry: BibEntry): string {
	const f = entry.fields;
	const data = {
		visible: false,
		featured: false,
		cite_key: entry.key,
		type: mapType(entry.type),
		title: cleanLatex(f.title ?? ''),
		authors: f.author ? parseAuthors(f.author) : [],
		journal: cleanLatex(f.journal ?? f.booktitle ?? ''),
		year: parseInt(f.year ?? '0', 10),
		volume: cleanLatex(f.volume ?? ''),
		pages: cleanLatex(f.pages ?? ''),
		doi: cleanLatex(f.doi ?? ''),
		abstract: cleanLatex(f.abstract ?? ''),
		pdf_url: '',
		project_slug: '',
		tags: [] as string[]
	};
	return stringify(data, { lineWidth: 0 });
}

function main() {
	if (!existsSync(BIB_PATH)) {
		console.error(`BibTeX file not found: ${BIB_PATH}`);
		process.exit(1);
	}

	if (!existsSync(OUT_DIR)) {
		mkdirSync(OUT_DIR, { recursive: true });
	}

	const bibContent = readFileSync(BIB_PATH, 'utf-8');
	const entries = parseBib(bibContent);

	let created = 0;
	let skipped = 0;

	for (const entry of entries) {
		// Skip non-publication types (strings, preambles, etc.)
		if (['string', 'preamble', 'comment'].includes(entry.type)) continue;

		const filename = `${entry.key}.yml`;
		const filepath = join(OUT_DIR, filename);

		if (existsSync(filepath)) {
			console.log(`SKIP (exists): ${filename}`);
			skipped++;
			continue;
		}

		writeFileSync(filepath, toYaml(entry), 'utf-8');
		console.log(`CREATED: ${filename}`);
		created++;
	}

	console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Total entries: ${entries.length}`);
}

main();
