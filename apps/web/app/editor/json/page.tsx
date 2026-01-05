import { memoryStore } from "@repo/store";
import { EditorClient } from "../../_components/EditorClient";
import { saveAsJson } from "../../_actions/save-content";

export default async function JsonEditorPage() {
    const content = await memoryStore.get("json");

    return (
        <div>
            <p className="text-gray-600 mb-4 text-sm">
                Content is saved as Lexical JSON format
            </p>
            <EditorClient content={content} format="json" saveAction={saveAsJson} />
        </div>
    );
}

