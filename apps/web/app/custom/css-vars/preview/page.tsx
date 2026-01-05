import { memoryStore } from "@repo/store";

export default async function CssVarsPreviewPage() {
    const content = await memoryStore.get("html");

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <a href="/custom/css-vars" className="text-blue-600 hover:text-blue-800 underline">
                    ← Back to Editor
                </a>
            </div>
            <h1 className="text-4xl font-bold mb-4">CSS Variables Preview</h1>
            <p className="text-gray-600 mb-4">
                Server-rendered HTML styled using CSS custom properties. The same variables used in the editor are applied here.
            </p>
            <div 
                className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none"
                style={{
                    // CSS Variables for styling - same as editor
                    '--luf-linebreak-color': '#3b82f6',
                    '--luf-linebreak-height': '4px',
                    '--luf-linebreak-spacing': '2rem',
                    '--luf-block-gap': '1rem',
                    '--luf-block-padding': '1rem 0',
                    '--luf-block-bg': '#f3f4f6',
                    '--luf-block-order-color': '#1e40af',
                    '--luf-block-order-size': '0.875em',
                    '--luf-block-editor-padding': '1rem',
                    '--luf-block-editor-bg': '#ffffff',
                    '--luf-block-editor-border-width': '2px',
                    '--luf-block-editor-border-color': '#3b82f6',
                    '--luf-block-editor-border-radius': '0.5rem',
                    '--luf-block-editor-static-border-width': '2px',
                    '--luf-block-editor-static-border-color': '#3b82f6',
                    '--luf-block-editor-static-padding': '0.5rem',
                    '--luf-block-delete-opacity': '0.7',
                } as React.CSSProperties}
            >
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
}

