import { memoryStore } from "@repo/store";
import { createHeadlessEditor } from "@lexical/headless";
import { $generateHtmlFromNodes } from "@lexical/html";
import {
    FootnoteBlockNode,
    FootnoteLineBreakNode,
    FootnoteReferenceNode,
} from "lexical-ugly-footnotes";
import { HeadingNode } from "@lexical/rich-text";

export default async function JsonPreviewPage() {
    const content = await memoryStore.get("json");

    // Create a headless editor to parse JSON and render as HTML
    // const editor = createHeadlessEditor({
    //     namespace: "preview",
    //     nodes: [HeadingNode, FootnoteBlockNode, FootnoteReferenceNode, FootnoteLineBreakNode],
    //     onError: console.error,
    // });

    // let html = "";

    // try {
    //     const editorState = editor.parseEditorState(content);
    //     editor.setEditorState(editorState);

    //     html = editor.read(() => {
    //         return $generateHtmlFromNodes(editor, null);
    //     });
    // } catch (error) {
    //     console.error("Failed to parse JSON content:", error);
    //     html = "<p>Failed to parse content</p>";
    // }

    // return (
    //     <div>
    //         <p className="text-gray-600 mb-4 text-sm">
    //             Server-side rendered preview from JSON state
    //         </p>
    //         <div
    //             className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none"
    //             dangerouslySetInnerHTML={{ __html: html }}
    //         />
    //     </div>
    // );
}
