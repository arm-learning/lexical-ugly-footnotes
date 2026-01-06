"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DemoNavbarProps {
    className?: string;
}

const demoTypes = [
    { key: "default", label: "Default", path: "/demo" },
    { key: "css-vars", label: "CSS Variables", path: "/demo/css-vars" },
    { key: "theme", label: "Theme Config", path: "/demo/theme" },
    { key: "override", label: "CSS Override", path: "/demo/override" },
    { key: "nested", label: "Nested Footnotes", path: "/demo/nested" },
] as const;

export function DemoNavbar({ className = "" }: DemoNavbarProps) {
    const pathname = usePathname();

    const getActiveDemoType = () => {
        if (pathname.startsWith("/demo/css-vars")) return "css-vars";
        if (pathname.startsWith("/demo/theme")) return "theme";
        if (pathname.startsWith("/demo/override")) return "override";
        if (pathname.startsWith("/demo/nested")) return "nested";
        if (pathname.startsWith("/demo")) return "default";
        return null;
    };

    const activeDemoType = getActiveDemoType();

    const baseTabStyles =
        "px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors";
    const activeStyles = "border-blue-500 text-blue-600 bg-blue-50";
    const inactiveStyles =
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

    return (
        <div className={`flex gap-1 border-b border-gray-200 ${className}`}>
            {demoTypes.map((demo) => {
                const isActive = activeDemoType === demo.key;
                return (
                    <Link
                        key={demo.key}
                        href={demo.path}
                        className={`${baseTabStyles} ${isActive ? activeStyles : inactiveStyles}`}
                    >
                        {demo.label}
                    </Link>
                );
            })}
        </div>
    );
}

