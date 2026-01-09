import { fileStore } from "@repo/store";
import { UnifiedEditorClient } from "../../_components/UnifiedEditorClient";
import { UnifiedFormatTabs } from "../../_components/UnifiedFormatTabs";
import { UnifiedViewTabs } from "../../_components/UnifiedViewTabs";

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NestedPageProps {
    searchParams: Promise<{ format?: string }>;
}

export default async function NestedPage({ searchParams }: NestedPageProps) {
    const params = await searchParams;
    const format = (params.format as "html" | "json") || "html";
    const demoType = "nested";

    const content = await fileStore.get(demoType, format);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Nested Footnotes Editor</h2>
                <div className="flex gap-4">
                    <UnifiedFormatTabs demoType={demoType} />
                    <UnifiedViewTabs demoType={demoType} />
                </div>
            </div>
            <p className="text-gray-600 mb-4">
                This editor demonstrates nested footnotes - footnotes within footnotes.
                The editor includes a demo block node that contains a nested editor where
                you can insert footnotes. These nested footnotes will appear within the
                demo block, showing how footnotes can be nested at multiple levels.
            </p>
            <p className="text-gray-600 mb-4 text-sm">
                Content is saved as {format.toUpperCase()} format
            </p>
            <UnifiedEditorClient
                content={content}
                format={format}
                demoType={demoType}
            />
        </div>
    );
}

