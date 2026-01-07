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
import FootnoteHotkeyPlugin from "./components/FootnoteHotkeyPlugin.js";
import { useRef } from "react";
import { $createTextNode, $getRoot, type LexicalEditor } from "lexical";
import { $createHeadingNode, HeadingNode } from "@lexical/rich-text";
import { $generateNodesFromDOM } from "@lexical/html";
import { blockReplacement, CustomBlockNode } from "./components/CustomBlock.js";
import {
  CustomReferenceNode,
  referenceReplacement,
} from "./components/CustomReference.js";
import {
  CustomLineBreakNode,
  lineBreakReplacement,
} from "./components/CustomLineBreak.js";

interface EditorCustomProps {
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

export function EditorCustom({ submitHandler, content }: EditorCustomProps) {
    console.log("🎉 EditorCustom rendered!");
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialConfig = {
    namespace: "MyEditor-Custom",
    theme,
    onError,
    nodes: [
      HeadingNode,
      CustomBlockNode,
      blockReplacement,
      CustomReferenceNode,
      referenceReplacement,
      CustomLineBreakNode,
      lineBreakReplacement,
    ],
    editorState: (editor) => {
      if (content && content[0] === "<") {
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
      const titleText = $createTextNode("Welcome to the footnote editor!");
      title.append(titleText);
      root.append(title);
    },
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
            {/* <FootnoteHotkeyPlugin /> */}
            <HistoryPlugin />
          </div>
        </SharedHistoryContext>
      </LexicalComposer>
      <button type="submit">Submit</button>
    </form>
  );
}
