import { memoryStore } from "@repo/store";
import { EditorClient } from "../_components/EditorClient";
import { saveAsHtml } from "../_actions/save-content";

export default async function CustomPage() {
    const content = await memoryStore.get("html");

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-4xl font-bold mb-4">Custom Styling Examples</h1>
            <p className="text-gray-600 mb-6">
                Default editor with HTML format. Explore different styling approaches:
            </p>
            <div className="mb-6 space-x-4">
                <a href="/custom/css-vars" className="text-blue-600 hover:text-blue-800 underline">
                    CSS Variables →
                </a>
                <a href="/custom/theme" className="text-blue-600 hover:text-blue-800 underline">
                    Theme Configuration →
                </a>
                <a href="/custom/override" className="text-blue-600 hover:text-blue-800 underline">
                    CSS Override →
                </a>
            </div>
            <EditorClient content={content} format="html" saveAction={saveAsHtml} />
        </div>
    );
}
