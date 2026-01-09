import { DemoNavbar } from "../_components/DemoNavbar";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Lexical Footnotes Editor</h1>
        <DemoNavbar className="mb-6" />
        {children}
      </div>
    </div>
  );
}
