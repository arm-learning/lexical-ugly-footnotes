import { memoryStore } from "@repo/store";

export default async function HtmlPreviewPage() {
    const content = await memoryStore.get("html");

    console.log({ content })
    return (
        <div>
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
