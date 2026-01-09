"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface EditorTabsProps {
  className?: string;
}

export function EditorTabs({ className = "" }: EditorTabsProps) {
  const pathname = usePathname();
  const isJsonActive = pathname === "/editor/json";
  const isHtmlActive = pathname === "/editor/html";

  const baseTabStyles =
    "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors";
  const activeStyles = "border-blue-500 text-blue-600 bg-blue-50";
  const inactiveStyles =
    "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

  return (
    <div className={`flex gap-1 border-b border-gray-200 ${className}`}>
      <Link
        href="/editor/json"
        className={`${baseTabStyles} ${isJsonActive ? activeStyles : inactiveStyles}`}
      >
        JSON Editor
      </Link>
      <Link
        href="/editor/html"
        className={`${baseTabStyles} ${isHtmlActive ? activeStyles : inactiveStyles}`}
      >
        HTML Editor
      </Link>
    </div>
  );
}
