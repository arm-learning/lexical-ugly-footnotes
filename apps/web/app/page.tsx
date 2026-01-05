import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8 md:p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Lexical Ugly Footnotes</h1>
        <p className="text-gray-600 max-w-2xl">
          A Lexical plugin for footnotes with server-side rendering support.
        </p>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        {/* Basic Editors */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Editors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/editor/json"
              className="px-6 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              JSON Editor
            </Link>
            <Link
              href="/editor/html"
              className="px-6 py-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
            >
              HTML Editor
            </Link>
          </div>
        </section>

        {/* Custom Styling Examples */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Custom Styling Examples</h2>
          <p className="text-sm text-gray-600 mb-4">
            Explore different approaches to styling footnotes
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/custom"
              className="px-4 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center border border-gray-300"
            >
              <div className="font-semibold">Default</div>
              <div className="text-xs text-gray-600 mt-1">Basic styling</div>
            </Link>
            <Link
              href="/custom/css-vars"
              className="px-4 py-3 bg-purple-100 text-purple-800 rounded-lg font-medium hover:bg-purple-200 transition-colors text-center border border-purple-300"
            >
              <div className="font-semibold">CSS Variables</div>
              <div className="text-xs text-purple-600 mt-1">Custom properties</div>
            </Link>
            <Link
              href="/custom/theme"
              className="px-4 py-3 bg-indigo-100 text-indigo-800 rounded-lg font-medium hover:bg-indigo-200 transition-colors text-center border border-indigo-300"
            >
              <div className="font-semibold">Theme Config</div>
              <div className="text-xs text-indigo-600 mt-1">Tailwind classes</div>
            </Link>
            <Link
              href="/custom/override"
              className="px-4 py-3 bg-pink-100 text-pink-800 rounded-lg font-medium hover:bg-pink-200 transition-colors text-center border border-pink-300"
            >
              <div className="font-semibold">CSS Override</div>
              <div className="text-xs text-pink-600 mt-1">Pure CSS</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
