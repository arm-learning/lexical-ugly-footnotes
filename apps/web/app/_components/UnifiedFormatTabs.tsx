"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface UnifiedFormatTabsProps {
    demoType: string;
    className?: string;
}

export function UnifiedFormatTabs({ demoType, className = "" }: UnifiedFormatTabsProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Determine if we're in preview mode
    const isPreview = pathname.includes("/preview");
    
    // Get current format from query params (defaults to html)
    const currentFormat = searchParams.get("format") || "html";
    
    // Build base paths
    const basePath = demoType === "default" ? "/demo" : `/demo/${demoType}`;
    const currentViewPath = isPreview ? `${basePath}/preview` : basePath;
    
    // Build format-specific paths (preserve current view)
    const htmlPath = currentViewPath;
    const jsonPath = `${currentViewPath}?format=json`;

    const baseTabStyles =
        "px-3 py-1.5 text-sm font-medium rounded-md transition-colors";
    const activeStyles = "bg-gray-200 text-gray-900";
    const inactiveStyles = "text-gray-500 hover:text-gray-700 hover:bg-gray-100";

    return (
        <div className={`flex gap-1 ${className}`}>
            <Link
                href={htmlPath}
                className={`${baseTabStyles} ${currentFormat === "html" ? activeStyles : inactiveStyles}`}
            >
                HTML
            </Link>
            <Link
                href={jsonPath}
                className={`${baseTabStyles} ${currentFormat === "json" ? activeStyles : inactiveStyles}`}
            >
                JSON
            </Link>
        </div>
    );
}

