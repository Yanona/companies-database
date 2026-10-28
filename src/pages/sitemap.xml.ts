import type { APIRoute } from "astro";
import { getEmDashCollection } from "emdash";
import { getSolutions, lastUpdated } from "../lib/solutions";

function escapeXml(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const GET: APIRoute = async ({ url }) => {
	const origin = url.origin;
	const { solutions } = await getSolutions();
	const { entries: pages } = await getEmDashCollection("pages", { status: "published" });

	const day = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);
	const newest = (dates: (Date | null)[]) =>
		dates.reduce<Date | null>((a, b) => (b && (!a || b > a) ? b : a), null);

	const urls: { loc: string; lastmod?: string }[] = [
		{ loc: `${origin}/`, lastmod: day(newest(solutions.map((s) => lastUpdated(s.data)))) },
		...solutions.map((s) => ({ loc: `${origin}/solutions/${s.slug}`, lastmod: day(lastUpdated(s.data)) })),
	];

	// Landing pages only for groups that have at least one solution.
	const groups = new Map<string, Date | null>();
	for (const s of solutions) {
		const keys = [
			...s.categories.map((t) => `/categories/${t.slug}`),
			...s.levels.map((t) => `/levels/${t.slug}`),
		];
		for (const key of keys) groups.set(key, newest([groups.get(key) ?? null, lastUpdated(s.data)]));
	}
	for (const [path, date] of groups) urls.push({ loc: origin + path, lastmod: day(date) });

	for (const page of pages) {
		urls.push({ loc: `${origin}/${page.id}`, lastmod: day(page.data.updatedAt ?? null) });
	}

	const body = urls
		.map((u) => `  <url><loc>${escapeXml(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`)
		.join("\n");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
		{ headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } },
	);
};
