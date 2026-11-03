import { Combobox } from "@cloudflare/kumo";
import { useMemo } from "react";
import countryCodes from "../../../src/data/country-codes.json";

interface Option {
	value: string;
	label: string;
}

interface FieldWidgetProps {
	value: unknown;
	onChange: (value: unknown) => void;
	label: string;
	id: string;
	required?: boolean;
	options?: unknown;
}

const CODES = countryCodes as Record<string, string>;

/** Flag emoji from a two-letter country code, e.g. "EE" -> 🇪🇪. Shows as letters where the OS has no flag emoji. */
function flag(country: string): string {
	const code = CODES[country];
	if (!code || !/^[A-Z]{2}$/.test(code)) return "";
	return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

function toOptions(options: unknown): Option[] {
	if (!Array.isArray(options)) return [];
	return options.map((o) => (typeof o === "string" ? { value: o, label: o } : (o as Option)));
}

/**
 * Searchable multi-select for long option lists: chosen values show as removable chips,
 * typing filters the list. Stores the same string array as EmDash's built-in multiSelect editor.
 */
function SearchMultiSelect({ value, onChange, label, required, options, withFlags }: FieldWidgetProps & { withFlags?: boolean }) {
	const items = useMemo(() => toOptions(options), [options]);
	const selectedValues = Array.isArray(value) ? (value as string[]) : [];
	// Keep values the option list no longer has, so saving never drops data silently
	const selected = selectedValues.map((v) => items.find((o) => o.value === v) ?? { value: v, label: v });
	const show = (o: Option) => (withFlags ? `${flag(o.value)} ${o.label}`.trim() : o.label);

	// One wrapper element: the editor spaces fields by their outer element, and Combobox renders a hidden input beside it
	return (
		<div>
			<Combobox
				multiple
				label={label}
				required={required}
				items={items}
				value={selected}
				onValueChange={(next: Option[]) => onChange(next.map((o) => o.value))}
				itemToStringLabel={(o: Option) => o.label}
				isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
			>
				<Combobox.TriggerMultipleWithInput
					placeholder={withFlags ? "Type a country…" : "Type to search…"}
					value={selected}
					renderItem={(o: Option) => (
						<Combobox.Chip key={o.value} removeLabel={`Remove ${o.label}`}>
							{show(o)}
						</Combobox.Chip>
					)}
				/>
				<Combobox.Content>
					<Combobox.Empty>No matches</Combobox.Empty>
					<Combobox.List>
						{(o: Option) => (
							<Combobox.Item key={o.value} value={o}>
								{show(o)}
							</Combobox.Item>
						)}
					</Combobox.List>
				</Combobox.Content>
			</Combobox>
		</div>
	);
}

export const fields = {
	countries: (props: FieldWidgetProps) => <SearchMultiSelect {...props} withFlags />,
	search: (props: FieldWidgetProps) => <SearchMultiSelect {...props} />,
};
