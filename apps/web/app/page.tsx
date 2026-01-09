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
        {/* Demo Editors */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Editor Demos
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Each demo supports both HTML and JSON formats with Editor and
            Preview views. Use the navbar to switch between different styling
            approaches.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Link
              href="/demo"
              className="px-4 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center border border-gray-300"
            >
              <div className="font-semibold">Default</div>
              <div className="text-xs text-gray-600 mt-1">Basic styling</div>
            </Link>
            <Link
              href="/demo/css-vars"
              className="px-4 py-3 bg-purple-100 text-purple-800 rounded-lg font-medium hover:bg-purple-200 transition-colors text-center border border-purple-300"
            >
              <div className="font-semibold">CSS Variables</div>
              <div className="text-xs text-purple-600 mt-1">
                Custom properties
              </div>
            </Link>
            <Link
              href="/demo/theme"
              className="px-4 py-3 bg-indigo-100 text-indigo-800 rounded-lg font-medium hover:bg-indigo-200 transition-colors text-center border border-indigo-300"
            >
              <div className="font-semibold">Theme Config</div>
              <div className="text-xs text-indigo-600 mt-1">
                Tailwind classes
              </div>
            </Link>
            <Link
              href="/demo/override"
              className="px-4 py-3 bg-pink-100 text-pink-800 rounded-lg font-medium hover:bg-pink-200 transition-colors text-center border border-pink-300"
            >
              <div className="font-semibold">CSS Override</div>
              <div className="text-xs text-pink-600 mt-1">Pure CSS</div>
            </Link>
            <Link
              href="/demo/nested"
              className="px-4 py-3 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition-colors text-center border border-blue-300"
            >
              <div className="font-semibold">Nested Footnotes</div>
              <div className="text-xs text-blue-600 mt-1">Nested editors</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
