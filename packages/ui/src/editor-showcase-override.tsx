"use client";
import { $generateNodesFromDOM } from "@lexical/html";
import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { $createTextNode, $getRoot, type LexicalEditor } from "lexical";
import {
  FootnoteBlockNode,
  FootnoteLineBreakNode,
  FootnotePlugin,
  FootnoteReferenceNode,
  SharedHistoryContext,
} from "lexical-ugly-footnotes/client";
import { useRef } from "react";
import FootnoteButton from "./components/FootnoteButton.js";

interface EditorShowcaseOverrideProps {
  submitHandler: (editor: LexicalEditor) => void;
  content: string | null;
}

const theme = {
  // Using default classes, but we'll override with CSS
};

function onError(error: Error) {
  console.error(error);
}

export const EditorShowcaseOverride = ({
  submitHandler,
  content,
}: EditorShowcaseOverrideProps) => {
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialConfig = {
    namespace: "Showcase-Override",
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
      const titleText = $createTextNode("CSS Override Styling");
      title.append(titleText);
      root.append(title);
    },
  } satisfies InitialConfigType;

  return (
    <div className="showcase-editor-override">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .showcase-editor-override .luf-block {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 1.5rem;
          border-radius: 1rem;
          gap: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .showcase-editor-override .luf-block-order {
          color: #ffffff;
          font-size: 1.25em;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .showcase-editor-override .luf-block-editor {
          background: rgba(255, 255, 255, 0.95);
          border: 3px solid #ffffff;
          border-radius: 0.75rem;
          padding: 1.25rem;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .showcase-editor-override .luf-linebreak {
          padding: 2rem 0;
        }
        
        .showcase-editor-override .luf-linebreak::after {
          height: 3px;
          background: linear-gradient(90deg, transparent, #667eea, #764ba2, transparent);
          border-radius: 2px;
        }
        
        .showcase-editor-override .luf-reference-sup {
          color: #667eea;
          font-weight: 700;
          padding: 0.125rem 0.375rem;
          background: rgba(102, 126, 234, 0.1);
          border-radius: 0.25rem;
        }
        
        .showcase-editor-override .luf-reference-sup:hover {
          background: rgba(102, 126, 234, 0.2);
        }
      `,
        }}
      />
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
};

export default EditorShowcaseOverride;
