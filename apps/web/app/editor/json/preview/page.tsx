import { memoryStore } from "@repo/store";
import { createHeadlessEditor } from "@lexical/headless";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
    FootnoteBlockNode,
    FootnoteLineBreakNode,
    FootnoteReferenceNode,
    } from "lexical-ugly-footnotes/server";
// import { HeadingNode } from "@lexical/rich-text";
import { parseHTML } from "linkedom";
import { HeadingNode } from "@lexical/rich-text";

export default async function JsonPreviewPage() {
    const content = await memoryStore.get("json");

    // Check if we're in a server environment
    if (typeof window !== "undefined") {
        throw new Error("This function must run on the server");
    }

    // Save previous global state
    const globalObj = global as unknown as { window?: typeof window; document?: typeof document };
    const prevWindow = globalObj.window;
    const prevDocument = globalObj.document;

    // Create new DOM environment
    const { window: newWindow, document: newDocument } = parseHTML("");
    globalObj.window = newWindow as typeof window;
    globalObj.document = newDocument as typeof document;

    let html = "";

    try {
        // Create headless editor
        const editor = createHeadlessEditor({
            namespace: "preview",
            // nodes: [HeadingNode],
            // nodes: [HeadingNode, FootnoteReferenceNode],
            nodes: [HeadingNode, FootnoteBlockNode, FootnoteReferenceNode, FootnoteLineBreakNode],
            // nodes: [FootnoteBlockNodeTest],
            onError: console.error,
        });

        // Parse and set editor state
        const editorState = editor.parseEditorState(content);
        editor.setEditorState(editorState);

        // Generate HTML
        html = editor.read(() => {
            return $generateHtmlFromNodes(editor, null);
        });
    } catch (error) {
        console.error("Failed to parse JSON content:", error);
        html = "<p>Failed to parse content</p>";
    } finally {
        // Restore previous global state
        globalObj.window = prevWindow;
        globalObj.document = prevDocument;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <p className="text-gray-600 mb-4 text-sm">
                Server-side rendered preview from JSON state
            </p>
            <div
                className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
}
