import { fileStore } from "@repo/store";
import { createHeadlessEditor } from "@lexical/headless";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
    FootnoteBlockNode,
    FootnoteLineBreakNode,
    FootnoteReferenceNode,
} from "lexical-ugly-footnotes/server";
import { parseHTML } from "linkedom";
import { HeadingNode } from "@lexical/rich-text";
import { $getRoot } from "lexical";
import { UnifiedFormatTabs } from "../../_components/UnifiedFormatTabs";
import { UnifiedViewTabs } from "../../_components/UnifiedViewTabs";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DemoPreviewPageProps {
    searchParams: Promise<{ format?: string }>;
}

export default async function DemoPreviewPage({
    searchParams,
}: DemoPreviewPageProps) {
    const params = await searchParams;
    const format = (params.format as "html" | "json") || "html";
    const demoType = "default";

    const content = await fileStore.get(demoType, format);

    let html = "";

    if (format === "json") {
        // Check if we're in a server environment
        if (typeof window !== "undefined") {
            throw new Error("This function must run on the server");
        }

        // Save previous global state
        const globalObj = global as unknown as {
            window?: typeof window;
            document?: typeof document;
        };
        const prevWindow = globalObj.window;
        const prevDocument = globalObj.document;

        // Create new DOM environment
        const { window: newWindow, document: newDocument } = parseHTML("");
        globalObj.window = newWindow as typeof window;
        globalObj.document = newDocument as typeof document;

        try {
            // Create headless editor
            const editor = createHeadlessEditor({
                namespace: "preview",
                nodes: [
                    HeadingNode,
                    FootnoteBlockNode,
                    FootnoteReferenceNode,
                    FootnoteLineBreakNode,
                ],
                onError: console.error,
            });

            // Parse and set editor state
            const editorState = editor.parseEditorState(content);
            editor.setEditorState(editorState);

            // Generate HTML
            html = editor.read(() => {
                try {
                    return $generateHtmlFromNodes(editor, null);
                } catch (error) {
                    console.error("Error generating HTML from nodes:", error);
                    throw error;
                }
            });
        } catch (error) {
            console.error("Failed to parse JSON content:", error);
            html = "<p>Failed to parse content</p>";
        } finally {
            // Restore previous global state
            globalObj.window = prevWindow;
            globalObj.document = prevDocument;
        }
    } else {
        html = content || "";
    }
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Default Preview</h2>
                <div className="flex gap-4">
                    <UnifiedFormatTabs demoType={demoType} />
                    <UnifiedViewTabs demoType={demoType} />
                </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">
                Server-side rendered preview from {format.toUpperCase()} content
            </p>
            <div
                className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}

