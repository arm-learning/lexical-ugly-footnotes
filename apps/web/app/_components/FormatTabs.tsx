"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface FormatTabsProps {
  format: "json" | "html";
  className?: string;
}

export function FormatTabs({ format, className = "" }: FormatTabsProps) {
  const pathname = usePathname();
  const basePath = `/editor/${format}`;
  const isEditorActive = pathname === basePath;
  const isPreviewActive = pathname === `${basePath}/preview`;

  const baseTabStyles =
    "px-3 py-1.5 text-sm font-medium rounded-md transition-colors";
  const activeStyles = "bg-gray-200 text-gray-900";
  const inactiveStyles = "text-gray-500 hover:text-gray-700 hover:bg-gray-100";

  return (
    <div className={`flex gap-1 ${className}`}>
      <Link
        href={basePath}
        className={`${baseTabStyles} ${isEditorActive ? activeStyles : inactiveStyles}`}
      >
        Editor
      </Link>
      <Link
        href={`${basePath}/preview`}
        className={`${baseTabStyles} ${isPreviewActive ? activeStyles : inactiveStyles}`}
      >
        Preview
      </Link>
    </div>
  );
}
