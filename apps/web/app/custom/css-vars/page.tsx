import { memoryStore } from "@repo/store";
import dynamic from "next/dynamic";
import { EditorShowcaseCssVars } from "@repo/ui";
import { saveAsHtml } from "../../_actions/save-content";

const CustomEditorClient = dynamic(
    () => import("../../_components/CustomEditorClient")
);

export default async function CssVarsPage() {
    const content = await memoryStore.get("html");

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <a href="/custom" className="text-blue-600 hover:text-blue-800 underline">
                    ← Back to Custom Examples
                </a>
            </div>
            <h1 className="text-4xl font-bold mb-4">CSS Variables Styling</h1>
            <p className="text-gray-600 mb-4">
                This editor uses CSS custom properties (variables) to style footnotes.
                Variables like <code className="bg-gray-100 px-1 rounded">--luf-block-gap</code> and{" "}
                <code className="bg-gray-100 px-1 rounded">--luf-block-editor-border-color</code> are set inline.
            </p>
            <div className="mb-4">
                <a href="/custom/css-vars/preview" className="text-blue-600 hover:text-blue-800 underline">
                    View Preview →
                </a>
            </div>
            <CustomEditorClient content={content} saveAction={saveAsHtml} EditorComponent={EditorShowcaseCssVars} />
        </div>
    );
}

