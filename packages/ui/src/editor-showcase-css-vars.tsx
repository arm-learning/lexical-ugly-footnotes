"use client";
import {
  LexicalComposer,
  type InitialConfigType,
} from "@lexical/react/LexicalComposer";
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
import { useRef } from "react";
import { $createTextNode, $getRoot, type LexicalEditor } from "lexical";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { $generateNodesFromDOM } from "@lexical/html";

interface EditorShowcaseCssVarsProps {
  submitHandler: (editor: LexicalEditor) => void;
  content: string | null;
}

const theme = {
  // Theme styling goes here
};

function onError(error: Error) {
  console.error(error);
}

export function EditorShowcaseCssVars({ submitHandler, content }: EditorShowcaseCssVarsProps) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialConfig = {
    namespace: "Showcase-CSSVars",
    theme,
    onError,
    nodes: [
      HeadingNode,
      FootnoteBlockNode,
      FootnoteReferenceNode,
      FootnoteLineBreakNode,
    ],
    editorState: (editor) => {
      if (content && content[0] === "<" && typeof window !== "undefined") {
        const dom = new DOMParser();
        const document = dom.parseFromString(content, "text/html");
        const nodes = $generateNodesFromDOM(editor, document);
        const root = $getRoot();
        root.clear();
        for (const node of nodes) {
          root.append(node);
        }
        return;
      }

      if (content) {
        const editorState = editor.parseEditorState(content);
        if (editorState.isEmpty()) {
          return;
        }
        return editor.setEditorState(editorState);
      }

      const root = $getRoot();
      const title = $createHeadingNode("h1");
      const titleText = $createTextNode("CSS Variables Styling");
      title.append(titleText);
      root.append(title);
    },
  } satisfies InitialConfigType;

  return (
    <div className="showcase-editor-css-vars" style={{
      // CSS Variables for styling
      '--luf-linebreak-color': '#3b82f6',
      '--luf-linebreak-height': '4px',
      '--luf-linebreak-spacing': '2rem',
      '--luf-block-gap': '1rem',
      '--luf-block-padding': '1rem 0',
      '--luf-block-bg': '#f3f4f6',
      '--luf-block-order-color': '#1e40af',
      '--luf-block-order-size': '0.875em',
      '--luf-block-editor-padding': '1rem',
      '--luf-block-editor-bg': '#ffffff',
      '--luf-block-editor-border-width': '2px',
      '--luf-block-editor-border-color': '#3b82f6',
      '--luf-block-editor-border-radius': '0.5rem',
      '--luf-block-editor-static-border-width': '2px',
      '--luf-block-editor-static-border-color': '#3b82f6',
      '--luf-block-editor-static-padding': '0.5rem',
      '--luf-block-delete-opacity': '0.7',
    } as React.CSSProperties}>
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
                //   // <p className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                //   //   Enter some text...
                //   // </p>
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
    </div>
  );
}

