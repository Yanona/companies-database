# EdTech Estonia Solutions Directory

Directory of edtech solutions built by EdTech Estonia members and associate members. Built with [Astro](https://astro.build) and [EmDash](https://github.com/emdash-cms/emdash), running on Cloudflare Workers (D1 database, R2 media storage).

The data model and the submission form are described in [`docs/data-model.md`](docs/data-model.md).

## Pages

| Page | Route |
|---|---|
| Browse all solutions (search + filters) | `/` |
| Solution page | `/solutions/:slug` |
| Category landing page | `/categories/:slug` |
| Education level landing page | `/levels/:slug` |
| Static pages (e.g. About) | `/:slug` |
| Sitemap / robots / AI overview | `/sitemap.xml`, `/robots.txt`, `/llms.txt` |
| CMS admin | `/_emdash/admin` |

## Local development

Requires Node.js 22.16 or later.

```bash
npm install
npm run dev
```

The first request creates the local database (in `.wrangler/`) with the schema from `seed/seed.json`. To also load the five fictional sample solutions:

```bash
npx astro dev stop
npx emdash seed seed/seed.json --skip-media --database "$(ls .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite | grep -v metadata)"
npm run dev
```

Admin: http://localhost:4321/_emdash/admin. In local development you can skip passkey setup with http://localhost:4321/_emdash/api/setup/dev-bypass?redirect=/_emdash/admin.

## Schema

The schema lives in `seed/seed.json`:

- **Solutions** collection: one entry per company. Admin-only fields (registry code, submitter, source, notes) are never rendered on the site.
- **Taxonomies:** `category`, `education_level`, `target_user`. Categories and education levels each get a landing page; the term description is used as the page intro.
- **Pages** collection for About and other static pages.

Fixed option lists (product languages, countries, open to, membership, HQ location) are `select` / `multiSelect` field options in the seed.

## Deploying to Cloudflare

Not set up yet. It needs a Cloudflare account, then:

1. `npx wrangler d1 create edtech-estonia-directory` and add the returned `database_id` to `wrangler.jsonc`.
2. `npx wrangler r2 bucket create edtech-estonia-media`.
3. `npm run deploy`.
4. In the Cloudflare dashboard, check that AI crawlers are **allowed** for the domain (Security → Bots / AI Crawl Control), otherwise answer engines cannot read the site.

The sample entries are marked "Fictional sample entry. Delete before launch." in their admin notes.
