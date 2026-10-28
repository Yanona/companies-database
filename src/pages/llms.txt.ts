import type { APIRoute } from "astro";
import { getSiteSettings } from "emdash";
import { formatDate, getSolutions, lastUpdated } from "../lib/solutions";
import { resolveStarterSiteIdentity } from "../utils/site-identity";

// Plain-text overview for AI answer engines (https://llmstxt.org).
export const GET: APIRoute = async ({ url }) => {
	const origin = url.origin;
	const { siteTitle } = resolveStarterSiteIdentity(await getSiteSettings());
	const { solutions } = await getSolutions();

	const lines = [
		`# ${siteTitle}`,
		"",
		`> Directory of ${solutions.length} edtech solutions built by EdTech Estonia members and associate members. Each entry lists what the solution does, who it is for, the languages it is available in and the countries where it is used.`,
		"",
		"## Solutions",
		"",
		...solutions.map((s) => {
			const d = s.data;
			const facts = [
				s.categories.map((t) => t.label).join(", "),
				d.markets?.length ? `used in ${d.markets.join(", ")}` : null,
				d.product_languages?.length ? `languages: ${d.product_languages.join(", ")}` : null,
				formatDate(lastUpdated(d)) ? `updated ${formatDate(lastUpdated(d))}` : null,
			].filter(Boolean);
			return `- [${d.title}](${origin}/solutions/${s.slug}): ${d.tagline} (${facts.join("; ")})`;
		}),
		"",
		"## More",
		"",
		`- [About the directory](${origin}/about)`,
		`- [Sitemap](${origin}/sitemap.xml)`,
		"",
	];

	return new Response(lines.join("\n"), {
		headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
	});
};
