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

interface EditorShowcaseThemeProps {
  submitHandler: (editor: LexicalEditor) => void;
  content: string | null;
}

const theme = {
  uglyFootnotes: {
    block: {
      container: "grid grid-cols-[auto_1fr_auto] gap-4 p-4 bg-purple-50 rounded-lg",
      order: "text-sm font-bold text-purple-600",
      editor: "border-2 border-purple-400 rounded-lg p-3 bg-white",
      editorFocused: "ring-2 ring-purple-500",
    },
    reference: {
      sup: "cursor-pointer text-purple-600 font-semibold hover:text-purple-800",
      supFocused: "ring-2 ring-purple-400 rounded",
      supActive: "bg-purple-100",
    },
    lineBreak: {
      container: "relative w-full py-4 cursor-pointer border-t-2 border-purple-300 my-4",
    },
  },
};

function onError(error: Error) {
  console.error(error);
}

export function EditorShowcaseTheme({ submitHandler, content }: EditorShowcaseThemeProps) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialConfig = {
    namespace: "Showcase-Theme",
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
      const titleText = $createTextNode("Theme-Based Styling");
      title.append(titleText);
      root.append(title);
    },
  } satisfies InitialConfigType;

  return (
    <div className="showcase-editor-theme">
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
    </div>
  );
}

