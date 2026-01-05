"use server";

import { revalidatePath } from "next/cache";
import { memoryStore } from "@repo/store";

export type SaveResult = {
    success: boolean;
    error?: string;
};

export async function saveAsJson(content: string): Promise<SaveResult> {
    try {
        await memoryStore.set(content, "json");
        return { success: true };
    } catch (error) {
        console.error("Failed to save JSON:", error);
        return { success: false, error: "Failed to save content" };
    }
}

export async function saveAsHtml(content: string): Promise<SaveResult> {
    try {
        await memoryStore.set(content, "html");
        revalidatePath("/editor/html/preview");
        revalidatePath("/custom/preview");
        revalidatePath("/custom/css-vars/preview");
        revalidatePath("/custom/theme/preview");
        revalidatePath("/custom/override/preview");
        return { success: true };
    } catch (error) {
        console.error("Failed to save HTML:", error);
        return { success: false, error: "Failed to save content" };
    }
}
