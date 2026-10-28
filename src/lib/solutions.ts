import { getEmDashCollection, getEntryTerms } from "emdash";
import countryCodes from "../data/country-codes.json";

export interface Term {
	slug: string;
	label: string;
	description?: string;
}

export interface Achievement {
	type: "Award" | "Certification" | "Research";
	name: string;
	year?: number;
	url?: string;
}

/** A solution entry with its taxonomy terms resolved. */
export interface Solution {
	slug: string;
	entry: any;
	data: any;
	categories: Term[];
	levels: Term[];
	users: Term[];
}

export const TAXONOMIES = {
	category: "category",
	level: "education_level",
	user: "target_user",
} as const;

const LANGUAGE_CODES: Record<string, string> = {
	Estonian: "et",
	English: "en",
	Russian: "ru",
	Ukrainian: "uk",
	Latvian: "lv",
	Lithuanian: "lt",
	Finnish: "fi",
	German: "de",
};

export const EDTECH_ESTONIA = { name: "EdTech Estonia", url: "https://www.edtechestonia.org" };

export function countryCode(name: string): string | undefined {
	return (countryCodes as Record<string, string>)[name];
}

export function languageCode(name: string): string | undefined {
	return LANGUAGE_CODES[name];
}

/** Value used in filter data attributes, e.g. "United Arab Emirates" -> "united-arab-emirates". */
export function slugify(value: string): string {
	return value
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
}

export function initials(title: string): string {
	const letters = [...title.replace(/[^\p{L}]/gu, "")];
	return (letters[0] ?? "?").toUpperCase() + (letters[1] ?? "").toLowerCase();
}

export function monogramColor(slug: string): string {
	let h = 0;
	for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
	return `var(--m${(h % 5) + 1})`;
}

export function isAssociate(data: any): boolean {
	return data.membership === "Associate member";
}

export function isListed(data: any): boolean {
	return (data.company_status ?? "Active") === "Active";
}

export function formatDate(value: Date | string | null | undefined): string | null {
	if (!value) return null;
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Last verified date, falling back to the last edit. */
export function lastUpdated(data: any): Date | null {
	const v = data.last_verified ?? data.updatedAt;
	if (!v) return null;
	const d = v instanceof Date ? v : new Date(v);
	return Number.isNaN(d.getTime()) ? null : d;
}

function toTerms(list: any[] | undefined): Term[] {
	return (list ?? []).map((t) => ({ slug: t.slug, label: t.label, description: t.description }));
}

export async function withTerms(entry: any): Promise<Solution> {
	const terms = entry.data.terms ?? {};
	const load = async (name: string) =>
		terms[name] ?? (await getEntryTerms("solutions", entry.data.id, name));
	const [categories, levels, users] = await Promise.all([
		load(TAXONOMIES.category),
		load(TAXONOMIES.level),
		load(TAXONOMIES.user),
	]);
	return {
		slug: entry.id,
		entry,
		data: entry.data,
		categories: toTerms(categories),
		levels: toTerms(levels),
		users: toTerms(users),
	};
}

/** All published, active solutions (optionally filtered by taxonomy term), sorted by name. */
export async function getSolutions(where?: Record<string, string | string[]>) {
	const entries: any[] = [];
	const cacheHints: any[] = [];
	let cursor: string | undefined;
	do {
		const result = await getEmDashCollection("solutions", {
			status: "published",
			limit: 100,
			cursor,
			where,
		});
		entries.push(...result.entries);
		cacheHints.push(result.cacheHint);
		cursor = result.nextCursor;
	} while (cursor);

	const solutions = (await Promise.all(entries.filter((e) => isListed(e.data)).map(withTerms))).sort(
		(a, b) => a.data.title.localeCompare(b.data.title, "et"),
	);
	return { solutions, cacheHints };
}

export function breadcrumbJsonLd(origin: string, items: { name: string; path: string }[]) {
	return {
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.name,
			item: origin + item.path,
		})),
	};
}

export function itemListJsonLd(origin: string, solutions: Solution[]) {
	return {
		"@type": "ItemList",
		numberOfItems: solutions.length,
		itemListElement: solutions.map((s, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${origin}/solutions/${s.slug}`,
			name: s.data.title,
		})),
	};
}

export function solutionJsonLd(origin: string, s: Solution) {
	const d = s.data;
	const pageUrl = `${origin}/solutions/${s.slug}`;
	const updated = lastUpdated(d);
	const awards = ((d.achievements ?? []) as Achievement[])
		.filter((a) => a.type === "Award")
		.map((a) => (a.year ? `${a.name} (${a.year})` : a.name));
	const inEstonia = d.hq_city === "Tallinn" || d.hq_city === "Tartu" || d.hq_city === "Other in Estonia";

	const org: Record<string, unknown> = {
		"@type": "Organization",
		"@id": `${pageUrl}#organization`,
		name: d.title,
		url: d.website,
		foundingDate: d.founded_year ? String(d.founded_year) : undefined,
		address: inEstonia
			? {
					"@type": "PostalAddress",
					addressLocality: d.hq_city === "Other in Estonia" ? undefined : d.hq_city,
					addressCountry: "EE",
				}
			: undefined,
		areaServed: (d.markets ?? []).map((name: string) => ({ "@type": "Country", name })),
		email: d.contact_email || undefined,
		sameAs: d.linkedin_url ? [d.linkedin_url] : undefined,
		memberOf: { "@type": "Organization", name: EDTECH_ESTONIA.name, url: EDTECH_ESTONIA.url },
		logo: d.logo?.src || undefined,
	};

	const app: Record<string, unknown> = {
		"@type": "SoftwareApplication",
		"@id": `${pageUrl}#software`,
		name: d.title,
		description: d.tagline,
		url: d.website,
		mainEntityOfPage: pageUrl,
		image: d.logo?.src || undefined,
		screenshot: (d.screenshots ?? []).map((r: any) => r.image?.src).filter(Boolean),
		applicationCategory: "EducationalApplication",
		inLanguage: (d.product_languages ?? []).map(languageCode).filter(Boolean),
		audience: [
			...s.users.map((u) => ({ "@type": "EducationalAudience", educationalRole: u.label })),
			...s.levels.map((l) => ({ "@type": "EducationalAudience", educationalLevel: l.label })),
		],
		award: awards.length ? awards : undefined,
		dateModified: updated ? updated.toISOString().slice(0, 10) : undefined,
		publisher: { "@id": `${pageUrl}#organization` },
	};

	return [app, org];
}
