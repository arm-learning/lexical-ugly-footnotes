import { memoryStore } from "@repo/store";

export default async function ThemePreviewPage() {
    const content = await memoryStore.get("html");

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <a href="/custom/theme" className="text-blue-600 hover:text-blue-800 underline">
                    ← Back to Editor
                </a>
            </div>
            <h1 className="text-4xl font-bold mb-4">Theme Configuration Preview</h1>
            <p className="text-gray-600 mb-4">
                Server-rendered HTML with theme-based styling. Since the HTML uses default classes, we apply Tailwind classes via CSS targeting.
            </p>
            <div className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none preview-theme-wrapper">
                <style dangerouslySetInnerHTML={{ __html: `
                    .preview-theme-wrapper .luf-block {
                        display: grid;
                        grid-template-columns: auto 1fr auto;
                        gap: 1rem;
                        padding: 1rem;
                        background-color: rgb(250 245 255);
                        border-radius: 0.5rem;
                    }
                    
                    .preview-theme-wrapper .luf-block-order {
                        font-size: 0.875rem;
                        font-weight: 700;
                        color: rgb(147 51 234);
                    }
                    
                    .preview-theme-wrapper .luf-block-editor {
                        border: 2px solid rgb(192 132 252);
                        border-radius: 0.5rem;
                        padding: 0.75rem;
                        background-color: rgb(255 255 255);
                    }
                    
                    .preview-theme-wrapper .luf-linebreak {
                        position: relative;
                        width: 100%;
                        padding: 1rem 0;
                        cursor: pointer;
                        border-top: 2px solid rgb(196 181 253);
                        margin: 1rem 0;
                    }
                    
                    .preview-theme-wrapper .luf-reference-sup {
                        cursor: pointer;
                        color: rgb(147 51 234);
                        font-weight: 600;
                    }
                    
                    .preview-theme-wrapper .luf-reference-sup:hover {
                        color: rgb(126 34 206);
                    }
                `}} />
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        </div>
    );
}

