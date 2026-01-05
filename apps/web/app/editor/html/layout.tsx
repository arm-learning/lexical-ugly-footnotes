import { FormatTabs } from "../../_components/FormatTabs";

export default function HtmlLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">HTML Format</h2>
                <FormatTabs format="html" />
            </div>
            {children}
        </div>
    );
}
