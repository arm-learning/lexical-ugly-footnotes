import { EditorCustom } from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import type { LexicalEditor } from "lexical";
import { useEffect, useState } from "react";
import { api } from "../lib/api-server";

export const Route = createFileRoute("/custom")({
  component: RouteComponent,
});

function RouteComponent() {
  const [initialContent, setInitialContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // Load initial content on mount
  useEffect(() => {
    const loadContent = async () => {
      try {
        const content = await api.getContent("json");
        setInitialContent(content);
      } catch (error) {
        console.error("Failed to load content:", error);
        // Continue with empty editor if load fails
        setInitialContent(null);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);
  const submitHandler = async (editor: LexicalEditor) => {
    console.log(editor);
  };
  //   console.log('custom client wrapper', { content });
  if (loading) {
    return <div>Loading editor...</div>;
  }
  return (
    <>
      <h1>Vite + React</h1>

      {saveStatus !== "idle" && (
        <div style={{ marginBottom: "10px", fontSize: "14px" }}>
          {saveStatus === "saving" && "💾 Saving..."}
          {saveStatus === "saved" && "✅ Saved!"}
          {saveStatus === "error" && "❌ Save failed"}
        </div>
      )}

      <div
        className="card"
        style={{ width: "100%", maxWidth: "800px", margin: "20px auto" }}
      >
        <h2>Lexical Editor</h2>
        <EditorCustom submitHandler={submitHandler} content={initialContent} />
        {/* < */}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <a href="/editor">Home</a>
    </>
  );
}
