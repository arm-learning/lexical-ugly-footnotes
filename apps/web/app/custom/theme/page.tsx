import { memoryStore } from "@repo/store";
import dynamic from "next/dynamic";
import { EditorShowcaseTheme } from "@repo/ui";
import { saveAsHtml } from "../../_actions/save-content";

const CustomEditorClient = dynamic(
    () => import("../../_components/CustomEditorClient"),
);

export default async function ThemePage() {
    const content = await memoryStore.get("html");

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <a href="/custom" className="text-blue-600 hover:text-blue-800 underline">
                    ← Back to Custom Examples
                </a>
            </div>
            <h1 className="text-4xl font-bold mb-4">Theme Configuration Styling</h1>
            <p className="text-gray-600 mb-4">
                This editor uses Lexical theme configuration to style footnotes with Tailwind CSS classes.
                The theme is passed through the editor&apos;s initialConfig, using full Tailwind utilities for both block.container and lineBreak.container.
            </p>
            <div className="mb-4">
                <a href="/custom/theme/preview" className="text-blue-600 hover:text-blue-800 underline">
                    View Preview →
                </a>
            </div>
            <CustomEditorClient content={content} saveAction={saveAsHtml} EditorComponent={EditorShowcaseTheme} />
        </div>
    );
}

