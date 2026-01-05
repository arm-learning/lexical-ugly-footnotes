import { memoryStore } from "@repo/store";
import dynamic from "next/dynamic";
import { EditorShowcaseOverride } from "@repo/ui";
import { saveAsHtml } from "../../_actions/save-content";

const CustomEditorClient = dynamic(
    () => import("../../_components/CustomEditorClient"), {
        // ssr: false,
        // loader: () => <div>Loading...</div>
    },
);

export default async function OverridePage() {
    const content = await memoryStore.get("html");

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <a href="/custom" className="text-blue-600 hover:text-blue-800 underline">
                    ← Back to Custom Examples
                </a>
            </div>
            <h1 className="text-4xl font-bold mb-4">CSS Override Styling</h1>
            <p className="text-gray-600 mb-4">
                This editor demonstrates how to override the default footnote styles using pure CSS.
                The default classes (like <code className="bg-gray-100 px-1 rounded">.luf-block</code>) are overridden with custom styles.
            </p>
            <div className="mb-4">
                <a href="/custom/override/preview" className="text-blue-600 hover:text-blue-800 underline">
                    View Preview →
                </a>
            </div>
            <CustomEditorClient content={content} saveAction={saveAsHtml} EditorComponent={EditorShowcaseOverride} />
        </div>
    );
}

