import { LexicalComposer } from "@lexical/react/LexicalComposer";
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
} from "lexical-ugly-footnotes";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import FootnoteButton from "./components/FootnoteButton.js";
import FootnoteHotkeyPlugin from "./components/FootnoteHotkeyPlugin.js";
import { useRef } from "react";
import type { LexicalEditor } from "lexical";

interface EditorProps {
  submitHandler: (editor: LexicalEditor) => void;
}
const theme = {
  // Theme styling goes here
};

function onError(error: Error) {
  console.error(error);
}

export function Editor({ submitHandler }: EditorProps) {
  const editorRef = useRef<LexicalEditor | null>(null);
  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [FootnoteBlockNode, FootnoteReferenceNode, FootnoteLineBreakNode],
  };

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
              placeholder={
                <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                  Enter some text...
                </div>
              }
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
