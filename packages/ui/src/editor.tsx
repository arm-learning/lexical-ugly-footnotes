"use client";
import { LexicalComposer, type InitialConfigType } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  FootnoteBlockNode,
  FootnoteLineBreakNode,
  FootnotePlugin,
  FootnoteReferenceNode,
  SharedHistoryContext,
} from "lexical-ugly-footnotes/client";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import FootnoteButton from "./components/FootnoteButton.js";
import FootnoteHotkeyPlugin from "./components/FootnoteHotkeyPlugin.js";
import { useRef } from "react";
import { $createTextNode, $getRoot, type LexicalEditor } from "lexical";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { $generateNodesFromDOM } from "@lexical/html";

interface EditorProps {
  submitHandler: (editor: LexicalEditor) => void;
  content: string | null;
  // jsonContent?: string;
}
const theme = {
  // Theme styling goes here
};

function onError(error: Error) {
  console.error(error);
}

export function Editor({ submitHandler, content }: EditorProps) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [HeadingNode, FootnoteBlockNode, FootnoteReferenceNode, FootnoteLineBreakNode],
    editorState: (editor) => {
      // Ensure content is a string before processing
      if (!content || typeof content !== 'string') {
        // If no content or invalid type, use default state
        const root = $getRoot();
        const title = $createHeadingNode("h1");
        const titleText = $createTextNode("Welcome to the footnote editor!");
        title.append(titleText);
        root.append(title);
        return;
      }

      // Check if content is HTML (starts with '<' after trimming whitespace)
      // Only parse HTML if we're in a browser environment (DOMParser requires window)
      if (content.trim().startsWith('<') && typeof window !== "undefined") {
        const dom = new DOMParser();
        const document = dom.parseFromString(content, "text/html");
        const nodes = $generateNodesFromDOM(editor, document);
        const root = $getRoot();
        root.clear();
        for (const node of nodes) {
          root.append(node);
        };
        return;
      }

      // If content looks like HTML but window is not available, skip parsing
      // (will be handled on client-side hydration)
      if (content.trim().startsWith('<') && typeof window === "undefined") {
        return;
      }

      // Don't try to parse as JSON if content looks like HTML
      // (even if window check failed, we shouldn't attempt JSON parsing)
      if (content.trim().startsWith('<')) {
        // If we get here, content is HTML but window check failed
        // This shouldn't happen on client-side, but be safe
        return;
      }

      // Try to parse as JSON
      if (content) {
        try {
          const editorState = editor.parseEditorState(content);
          if (editorState.isEmpty()) {
            return;
          }
          return editor.setEditorState(editorState);
        } catch (error) {
          // If JSON parsing fails, it might be HTML that wasn't detected
          // Try parsing as HTML as fallback (only if window is available)
          if (content.trim().startsWith('<') && typeof window !== "undefined") {
            const dom = new DOMParser();
            const document = dom.parseFromString(content, "text/html");
            const nodes = $generateNodesFromDOM(editor, document);
            const root = $getRoot();
            root.clear();
            for (const node of nodes) {
              root.append(node);
            };
            return;
          }
          // If it's not HTML either, log the error and continue with default state
          console.error("Failed to parse content:", error);
          return;
        }
      }

      const root = $getRoot();
      const title = $createHeadingNode("h1");
      const titleText = $createTextNode("Welcome to the footnote editor!");
      title.append(titleText);
      root.append(title);
    }
  } satisfies InitialConfigType;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (editorRef.current) {
          submitHandler(editorRef.current);
        }
      }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <SharedHistoryContext>
          <FootnoteButton />
          <div className="relative border rounded-md p-4 min-h-[200px]">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="outline-none min-h-[150px]" />
              }
              // placeholder={
              //   <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
              //     Enter some text...
              //   </div>
              // }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <EditorRefPlugin editorRef={editorRef} />
            <FootnotePlugin />
            <HistoryPlugin />
          </div>
        </SharedHistoryContext>
      </LexicalComposer>
      <button type="submit">Submit</button>
    </form>
  );
}
