# lauguimel.github.io — Academic Portfolio

## Description
Professional academic portfolio for Guillaume Maitrejean, hosted on GitHub Pages.

## Stack
- SvelteKit 2 + Svelte 5 (static adapter)
- Tailwind CSS v4
- TypeScript
- Content: YAML files in content/

## Structure
- `content/` — YAML content files (projects, publications, teaching, site config)
- `src/lib/types.ts` — TypeScript interfaces
- `src/lib/content.ts` — YAML loading via import.meta.glob
- `src/lib/components/` — Svelte components
- `src/routes/` — SvelteKit pages
- `scripts/` — Utility scripts (bib2yaml)
- `static/` — Static assets (images, CV PDF)
- `build/` — Generated static site (gitignored)

## Key commands
- `npm run dev` — Development server
- `npm run build` — Build static site to build/
- `npm run preview` — Preview built site
- `npx tsx scripts/bib2yaml.ts` — Generate publication YAML from BibTeX

## Content management
Each content item (project, publication, course) has a YAML file with `visible: true/false`.
Set `visible: false` to hide an item, rebuild to apply.
Set `featured: true` to show on the home page.

## Versioning
This project uses semantic versioning (MAJOR.MINOR.PATCH).
- PATCH: bug fixes, small corrections, typo fixes
- MINOR: new feature, new analysis, new section, config change
- MAJOR: breaking change, complete rewrite, publication submission
Current version is tracked in `VERSION` and `CHANGELOG.md`.
When committing a notable change, update both files and tag: `git tag vX.Y.Z`

## Out of scope
- Backend / API / database
- Contact form (static site)
- CMS

## Language
- Communication: French
- Code, comments, commits: English
