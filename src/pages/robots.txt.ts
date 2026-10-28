import type { APIRoute } from "astro";

// Search engines and AI answer engines are explicitly welcome; only the CMS admin is off limits.
const AGENTS = [
	"*",
	"Googlebot",
	"Bingbot",
	"Google-Extended",
	"GPTBot",
	"OAI-SearchBot",
	"ChatGPT-User",
	"ClaudeBot",
	"Claude-SearchBot",
	"Claude-User",
	"PerplexityBot",
	"Perplexity-User",
	"Applebot-Extended",
];

export const GET: APIRoute = ({ url }) => {
	const rules = AGENTS.map((agent) => `User-agent: ${agent}\nAllow: /\nDisallow: /_emdash/`).join("\n\n");
	return new Response(`${rules}\n\nSitemap: ${url.origin}/sitemap.xml\n`, {
		headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
	});
};
