# Plan: Academic Portfolio Website (lauguimel.github.io)
Generated: 2026-03-10
Test command: npm run build

## Phase 1 — SvelteKit scaffold (buildable skeleton)
**Files to create:** package.json, svelte.config.js, vite.config.ts, tsconfig.json, src/app.html, src/app.css, src/routes/+layout.svelte, src/routes/+layout.ts, src/routes/+page.svelte, .gitignore
**What to implement:** Minimal SvelteKit project with @sveltejs/adapter-static, TypeScript, Tailwind CSS v4 (via @tailwindcss/vite), and a single home route rendering placeholder content. +layout.ts exports prerender = true for full static generation. app.css imports Tailwind. package.json pins SvelteKit 2.x, Svelte 5.x, adapter-static, vite, tailwindcss, @tailwindcss/vite, and yaml.
**Success test:** npm install && npm run build produces a build/ directory with index.html
**Status:** done

## Phase 2 — Content system (types + YAML loading + sample data)
**Files to create:** src/lib/types.ts, src/lib/content.ts, content/site.yml, content/projects/deforestation.yml (1 sample), content/publications/maitrejean2022rheological.yml (1 sample), content/teaching/ia-appliquee.yml (1 sample)
**What to implement:** TypeScript interfaces for SiteConfig, Project, Publication, TeachingItem with visible boolean field. content.ts uses import.meta.glob with { eager: true, query: '?raw' } to load YAML at build time, filters by visible === true, exports typed getters. site.yml contains personal info. One sample YAML per content type.
**Success test:** npm run build succeeds. Home page displays content count from YAML.
**Status:** done

## Phase 3 — Components + layout + themed home page
**Files to create:** src/lib/components/Header.svelte, src/lib/components/Footer.svelte, src/lib/components/ThemeToggle.svelte, src/lib/components/Hero.svelte, src/lib/components/ProjectCard.svelte, src/lib/components/PublicationItem.svelte, src/lib/components/CourseItem.svelte
**Files to modify:** src/routes/+layout.svelte, src/routes/+page.svelte, src/routes/+page.ts, src/app.css
**What to implement:** Header with responsive nav (7 sections), mobile hamburger, ThemeToggle with localStorage + class="dark" strategy. Footer with social links. Hero with name, title, bio, avatar placeholder. Home page composes Hero + featured projects + latest publications. All components use Tailwind with dark: variants.
**Success test:** npm run build succeeds. build/index.html contains styled home page with header, hero, cards, footer.
**Status:** done

## Phase 4 — All remaining pages
**Files to create:** src/routes/about/+page.svelte, src/routes/publications/+page.svelte, src/routes/publications/+page.ts, src/routes/projects/+page.svelte, src/routes/projects/+page.ts, src/routes/projects/[slug]/+page.svelte, src/routes/projects/[slug]/+page.ts, src/routes/teaching/+page.svelte, src/routes/teaching/+page.ts, src/routes/cv/+page.svelte, src/routes/contact/+page.svelte
**What to implement:** Each page loads content from YAML system. Publications grouped by year. Projects as grid of cards. projects/[slug] uses entries() for static generation. Teaching shows course cards. CV embeds PDF. About shows extended bio + skills. Contact shows links.
**Success test:** npm run build generates HTML for all routes (build/about/index.html, build/projects/index.html, etc.)
**Status:** done

## Phase 5 — bib2yaml + GitHub Actions + SEO + polish
**Files to create:** scripts/bib2yaml.ts, .github/workflows/deploy.yml, src/lib/components/SEO.svelte, CLAUDE.md, VERSION, CHANGELOG.md, static/.nojekyll
**Files to modify:** all +page.svelte (add SEO component)
**What to implement:** bib2yaml.ts reads BibTeX files and outputs YAML per publication with visible: false default. GitHub Actions deploys build/ to GitHub Pages. SEO component sets svelte:head with title, description, og:tags. CLAUDE.md documents project. VERSION=0.1.0.
**Success test:** npm run build succeeds. YAML generation script runs without error.
**Status:** done
