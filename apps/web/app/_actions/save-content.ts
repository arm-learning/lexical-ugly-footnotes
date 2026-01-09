"use server";

import { fileStore } from "@repo/store";
import { revalidatePath } from "next/cache";

export type SaveResult = {
  success: boolean;
  error?: string;
};

export type DemoType =
  | "default"
  | "css-vars"
  | "theme"
  | "override"
  | "nested"
  | "hackernews";

// Unified save function
export async function saveContent(
  content: string,
  demoType: DemoType = "default",
  format: "html" | "json" = "html",
): Promise<SaveResult> {
  try {
    await fileStore.set(content, demoType, format);

    // Revalidate preview paths for the demo type
    // Revalidate both with and without format query param
    revalidatePath(`/demo/${demoType}/preview`);
    revalidatePath(`/demo/${demoType}/preview?format=html`);
    revalidatePath(`/demo/${demoType}/preview?format=json`);
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

// Reset content to defaults
export async function resetContent(
  demoType: DemoType = "default",
  format?: "html" | "json",
): Promise<SaveResult> {
  try {
    await fileStore.reset(demoType, format);

    // Revalidate both editor and preview paths
    revalidatePath(`/demo/${demoType}`);
    revalidatePath(`/demo/${demoType}?format=html`);
    revalidatePath(`/demo/${demoType}?format=json`);
    revalidatePath(`/demo/${demoType}/preview`);
    revalidatePath(`/demo/${demoType}/preview?format=html`);
    revalidatePath(`/demo/${demoType}/preview?format=json`);

    return { success: true };
  } catch (error) {
    console.error(`Failed to reset ${format || "all"} for ${demoType}:`, error);
    return { success: false, error: "Failed to reset content" };
  }
}
