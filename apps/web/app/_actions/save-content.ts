"use server";

import { revalidatePath } from "next/cache";
import { memoryStore } from "@repo/store";

export type SaveResult = {
    success: boolean;
    error?: string;
};

export type DemoType = "default" | "css-vars" | "theme" | "override" | "nested" | "hackernews";

// Unified save function
export async function saveContent(
    content: string,
    demoType: DemoType = "default",
    format: "html" | "json" = "html"
): Promise<SaveResult> {
    try {
        await memoryStore.set(content, demoType, format);
        // Revalidate preview paths for the demo type
        if (format === "html") {
            revalidatePath(`/demo/${demoType}/preview`);
        } else {
            revalidatePath(`/demo/${demoType}/preview`);
        }
        return { success: true };
    } catch (error) {
        console.error(`Failed to save ${format} for ${demoType}:`, error);
        return { success: false, error: "Failed to save content" };
    }
}

// Backward compatibility functions (default to 'default' demo type)
export async function saveAsJson(content: string): Promise<SaveResult> {
    return saveContent(content, "default", "json");
}

export async function saveAsHtml(content: string): Promise<SaveResult> {
    return saveContent(content, "default", "html");
}
