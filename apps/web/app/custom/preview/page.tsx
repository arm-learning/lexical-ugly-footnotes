import { memoryStore } from "@repo/store";

export default async function CustomPreviewPage() {
    const content = await memoryStore.get("html");

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <a href="/custom" className="text-blue-600 hover:text-blue-800 underline">
                    ← Back to Editor
                </a>
            </div>
            <h1 className="text-4xl font-bold mb-4">Preview</h1>
            <p className="text-gray-600 mb-4 text-sm">
                Server-side rendered preview from HTML content
            </p>
            <div
                className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
}
