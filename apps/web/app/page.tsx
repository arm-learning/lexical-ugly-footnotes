import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-24">
      <h1 className="text-4xl font-bold">Lexical Ugly Footnotes</h1>
      <p className="text-gray-600 text-center max-w-md">
        A Lexical plugin for footnotes with server-side rendering support.
        Choose an editor format below.
      </p>

      <div className="flex gap-4">
        <Link
          href="/editor/json"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          JSON Editor
        </Link>
        <Link
          href="/editor/html"
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          HTML Editor
        </Link>
      </div>
    </div>
  );
}
