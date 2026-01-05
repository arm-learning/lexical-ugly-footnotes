import { FormatTabs } from "../../_components/FormatTabs";

export default function JsonLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">JSON Format</h2>
                <FormatTabs format="json" />
            </div>
            {children}
        </div>
    );
}
