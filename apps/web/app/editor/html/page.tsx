import { memoryStore } from "@repo/store";
import { EditorClient } from "../../_components/EditorClient";
import { saveAsHtml } from "../../_actions/save-content";

export default async function HtmlEditorPage() {
    const content = await memoryStore.get("html");

    return (
        <div>
            <p className="text-gray-600 mb-4 text-sm">
                Content is saved as HTML markup
            </p>
            <EditorClient content={content} format="html" saveAction={saveAsHtml} />
        </div>
    );
}

