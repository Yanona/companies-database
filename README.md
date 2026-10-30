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

Live at https://edtech-estonia-directory.yana-playground.workers.dev (Cloudflare Workers + D1 database `edtech-estonia-directory`).

```bash
npm run deploy
```

Media storage (R2) is not set up yet, so logo and image uploads do not work. To enable it: create the bucket with `npx wrangler r2 bucket create edtech-estonia-media`, then uncomment `r2_buckets` in `wrangler.jsonc` and `storage` in `astro.config.mjs`, and redeploy.

### After updating EmDash

New EmDash versions can add database migrations. Build, then check and apply them against the production database:

```bash
npm run build
set -a && . ./.env.migrate && set +a   # CLOUDFLARE_API_TOKEN (D1 Edit) + CLOUDFLARE_ACCOUNT_ID
npx emdash migrate --status --wrangler-config wrangler.jsonc
npx emdash migrate --wrangler-config wrangler.jsonc
npx wrangler deploy
```

Keep the API token in `.env.migrate`, not `.env`: Wrangler reads `.env` automatically and would use the D1-only token for deploys, which fails.

### Admin sign-in

The admin is at `/_emdash/admin` (also linked as "Sign in" in the footer). Passkeys only work on the address where they were created, so before moving the site to a new domain, set up email or use **Settings → General → Change domain** while still signed in at the old address.

Still to do: in the Cloudflare dashboard, check that AI crawlers are **allowed** for the domain (Security → Bots / AI Crawl Control), otherwise answer engines cannot read the site.

The sample entries (seed and live site) are marked "Fictional sample entry. Delete before launch." in their admin notes and use `.example` web addresses.
