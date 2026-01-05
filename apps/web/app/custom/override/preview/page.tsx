import { memoryStore } from "@repo/store";

export default async function OverridePreviewPage() {
    const content = await memoryStore.get("html");

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <a href="/custom/override" className="text-blue-600 hover:text-blue-800 underline">
                    ← Back to Editor
                </a>
            </div>
            <h1 className="text-4xl font-bold mb-4">CSS Override Preview</h1>
            <p className="text-gray-600 mb-4">
                Server-rendered HTML with CSS overrides applied. The default classes are overridden with custom styles.
            </p>
            <div className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none preview-override-wrapper">
                <style dangerouslySetInnerHTML={{ __html: `
                    .preview-override-wrapper .luf-block {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 1.5rem;
                        border-radius: 1rem;
                        gap: 1.5rem;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    }
                    
                    .preview-override-wrapper .luf-block-order {
                        color: #ffffff;
                        font-size: 1.25em;
                        font-weight: 700;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                    
                    .preview-override-wrapper .luf-block-editor {
                        background: rgba(255, 255, 255, 0.95);
                        border: 3px solid #ffffff;
                        border-radius: 0.75rem;
                        padding: 1.25rem;
                        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                    
                    .preview-override-wrapper .luf-linebreak {
                        padding: 2rem 0;
                    }
                    
                    .preview-override-wrapper .luf-linebreak::after {
                        height: 3px;
                        background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
                        border-radius: 2px;
                    }
                    
                    .preview-override-wrapper .luf-reference-sup {
                        color: #667eea;
                        font-weight: 700;
                        padding: 0.125rem 0.375rem;
                        background: rgba(102, 126, 234, 0.1);
                        border-radius: 0.25rem;
                    }
                    
                    .preview-override-wrapper .luf-reference-sup:hover {
                        background: rgba(102, 126, 234, 0.2);
                    }
                `}} />
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
}

