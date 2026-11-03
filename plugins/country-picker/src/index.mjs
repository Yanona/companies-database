import { definePlugin } from "emdash";

const ID = "country-picker";
const VERSION = "0.1.0";
const ADMIN = "@edtech/plugin-country-picker/admin";

/** Descriptor for `plugins: []` in astro.config.mjs. */
export function countryPicker() {
	return {
		id: ID,
		version: VERSION,
		format: "native",
		entrypoint: "@edtech/plugin-country-picker",
		adminEntry: ADMIN,
	};
}

export function createPlugin() {
	return definePlugin({
		id: ID,
		version: VERSION,
		admin: {
			entry: ADMIN,
			fieldWidgets: [
				{ name: "countries", label: "Searchable country picker", fieldTypes: ["multiSelect"] },
				{ name: "search", label: "Searchable multi-select", fieldTypes: ["multiSelect"] },
			],
		},
	});
}
