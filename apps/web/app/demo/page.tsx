import { memoryStore } from "@repo/store";
import { UnifiedEditorClient } from "../_components/UnifiedEditorClient";
import { UnifiedFormatTabs } from "../_components/UnifiedFormatTabs";
import { UnifiedViewTabs } from "../_components/UnifiedViewTabs";

interface DemoPageProps {
    searchParams: Promise<{ format?: string }>;
}

export default async function DemoPage({ searchParams }: DemoPageProps) {
    const params = await searchParams;
    const format = (params.format as "html" | "json") || "html";
    const demoType = "default";

    const content = await memoryStore.get(demoType, format);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Default Editor</h2>
                <div className="flex gap-4">
                    <UnifiedFormatTabs demoType={demoType} />
                    <UnifiedViewTabs demoType={demoType} />
                </div>
            </div>
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

