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
import { hackerNewsBlockReplacement, HackerNewsBlockNode } from "./components/HackerNewsBlock.js";
import {
  HackerNewsReferenceNode,
  hackerNewsReferenceReplacement,
} from "./components/HackerNewsReference.js";
import {
  HackerNewsLineBreakNode,
  hackerNewsLineBreakReplacement,
} from "./components/HackerNewsLineBreak.js";

interface EditorShowcaseHackerNewsProps {
  submitHandler: (editor: LexicalEditor) => void;
  content: string | null;
}

const theme = {
  // Minimal theme for Hacker News style
};

function onError(error: Error) {
  console.error(error);
}

export const EditorShowcaseHackerNews = ({ submitHandler, content }: EditorShowcaseHackerNewsProps) => {
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialConfig = {
    namespace: "Showcase-HackerNews",
    theme,
    onError,
    nodes: [
      HeadingNode,
      HackerNewsBlockNode,
      hackerNewsBlockReplacement,
      HackerNewsReferenceNode,
      hackerNewsReferenceReplacement,
      HackerNewsLineBreakNode,
      hackerNewsLineBreakReplacement,
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
      const titleText = $createTextNode("Hacker News Style Footnotes");
      title.append(titleText);
      root.append(title);
    },
  } satisfies InitialConfigType;

  return (
    <div className="showcase-editor-hackernews">
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

export default EditorShowcaseHackerNews;

