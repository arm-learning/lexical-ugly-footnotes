import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import type { LexicalEditor, NodeKey } from "lexical";
import { XIcon } from "lucide-react";
import { useSharedHistoryState } from "./SharedHistoryState.js";
import { theme } from "../nodes/BlockNode.js";
import {
  $removeFootnoteByBlockNodeKeyTwo,
  $removeFootnoteReferenceNodeByReferenceId,
} from "../core/index.js";

// const EditorContentFloatingToolbar = dynamic(
// 	() =>
// 		import(
// 			"@/app/_components/EditorContent/plugins/EditorContentFloatingToolbar"
// 		),
// 	{
// 		ssr: false,
// 	},
// );

// interface SharedHistoryStateComponentProps {}

// const SharedHistoryStateComponent = ({}: SharedHistoryStateComponentProps) => {
//   const { historyState } = useSharedHistoryState();
//   return (
//     <>
//       <HistoryPlugin externalHistoryState={historyState} />
//     </>
//   );
// };


interface FootnoteBlockComponentProps {
  referenceId: string | null;
  nodeKey: NodeKey;
  order: number | null;
  blockNote: LexicalEditor;
  sharedHistoryState?: boolean;
}

const FootnoteBlockComponent = ({
  referenceId = "",
  nodeKey,
  order = 0,
  blockNote,
  sharedHistoryState = true,
}: FootnoteBlockComponentProps) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const { historyState } = useSharedHistoryState();

  const onSubmit = () => {
    editor.update(
      () => {
        $removeFootnoteByBlockNodeKeyTwo(nodeKey);
      },
      { discrete: true },
    );
    editor.update(
      () => {
        if (referenceId) {
          $removeFootnoteReferenceNodeByReferenceId(referenceId);
        }
      },
      { discrete: true },
    );
  };

  return (
    <>
      <div>
        <sup>{order}</sup>
      </div>
      <LexicalNestedComposer initialEditor={blockNote} initialTheme={theme}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="h-full outline-none relative rounded-xl px-1 py-3 bg-background border-2 border-primary/50" />
          }
          ErrorBoundary={LexicalErrorBoundary}
          placeholder={null}
        />
        <LinkPlugin
          attributes={{
            rel: "noopener noreferrer",
            target: "_blank",
          }}
        />
        <HistoryPlugin externalHistoryState={historyState} />
        {/* {sharedHistoryState ? <SharedHistoryStateComponent /> : <HistoryPlugin />} */}
      </LexicalNestedComposer>
      <button type="button" onClick={onSubmit}>
        <XIcon />
      </button>
    </>
  );
};

export default FootnoteBlockComponent;
