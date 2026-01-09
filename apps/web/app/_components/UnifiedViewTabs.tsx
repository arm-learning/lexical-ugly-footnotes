"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface UnifiedViewTabsProps {
  demoType: string;
  className?: string;
}

export function UnifiedViewTabs({
  demoType,
  className = "",
}: UnifiedViewTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const format = searchParams.get("format") || "html";

  const basePath = demoType === "default" ? "/demo" : `/demo/${demoType}`;

  // Preserve format when switching views
  const formatParam = format === "json" ? "?format=json" : "";
  const editorPath = `${basePath}${formatParam}`;
  const previewPath = `${basePath}/preview${formatParam}`;

  const isEditorActive =
    pathname === basePath && !pathname.includes("/preview");
  const isPreviewActive = pathname.includes("/preview");

  const baseTabStyles =
    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors";
  const activeStyles = "bg-gray-200 text-gray-900";
  const inactiveStyles = "text-gray-500 hover:text-gray-700 hover:bg-gray-100";

  return (
    <div className={`flex gap-1 ${className}`}>
      <Link
        href={editorPath}
        className={`${baseTabStyles} ${isEditorActive ? activeStyles : inactiveStyles}`}
      >
        Editor
      </Link>
      <Link
        href={previewPath}
        className={`${baseTabStyles} ${isPreviewActive ? activeStyles : inactiveStyles}`}
      >
        Preview
      </Link>
    </div>
  );
}
