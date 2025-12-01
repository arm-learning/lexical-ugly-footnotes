import { footnoteService } from "./index.js";

const orderMapForExport: Map<string, number> | null = null;

export function getRenderedOrderForId(id: string): number | null {
	// 1) If an explicit export map is provided (SSR/export), use it
	if (orderMapForExport?.has(id)) {
		return orderMapForExport.get(id)!;
	}

	// 2) Otherwise (runtime), ask the service if available
	try {
		const idx = footnoteService.indexOf(id);
		if (idx !== undefined) return idx + 1;
	} catch {
		// service might not be initialized in some environments; ignore
	}
	return null;
}