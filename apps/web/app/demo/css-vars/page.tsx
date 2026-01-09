import { fileStore } from "@repo/store";
import { UnifiedEditorClient } from "../../_components/UnifiedEditorClient";
import { UnifiedFormatTabs } from "../../_components/UnifiedFormatTabs";
import { UnifiedViewTabs } from "../../_components/UnifiedViewTabs";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface CssVarsPageProps {
  searchParams: Promise<{ format?: string }>;
}

export default async function CssVarsPage({ searchParams }: CssVarsPageProps) {
  const params = await searchParams;
  const format = (params.format as "html" | "json") || "html";
  const demoType = "css-vars";

  const content = await fileStore.get(demoType, format);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">CSS Variables Editor</h2>
        <div className="flex gap-4">
          <UnifiedFormatTabs demoType={demoType} />
          <UnifiedViewTabs demoType={demoType} />
        </div>
      </div>
      <p className="text-gray-600 mb-4">
        This editor uses CSS custom properties (variables) to style footnotes.
        Variables like{" "}
        <code className="bg-gray-100 px-1 rounded">--luf-block-gap</code> and{" "}
        <code className="bg-gray-100 px-1 rounded">
          --luf-block-editor-border-color
        </code>{" "}
        are set inline.
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
