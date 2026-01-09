import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { twMerge } from "tailwind-merge";
import {
  $removeFootnoteByBlockNodeKey,
  $removeFootnoteReferenceNodeByReferenceId,
} from "../core/component-utils.js";
import { theme } from "../nodes/BlockNode.server.js";
import type { BlockComponentProps } from "../types/block.js";
import { useSharedHistoryState } from "./SharedHistoryState.js";

// X icon component
const XIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

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

// export interface FootnoteBlockComponentProps {
//   referenceId: string | null;
//   nodeKey: NodeKey;
//   order: number | null;
//   blockNote: LexicalEditor;
//   sharedHistoryState?: boolean;
// }

const FootnoteBlockComponent = ({
  referenceId = "",
  nodeKey,
  order = 0,
  blockNote,
  sharedHistoryState = true,
  classNames,
}: BlockComponentProps) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const { historyState } = useSharedHistoryState();

  const onSubmit = () => {
    editor.update(
      () => {
        $removeFootnoteByBlockNodeKey(nodeKey);
        // Note: $removeFootnoteByBlockNodeKey already removes both the block node
        // and all reference nodes with the same referenceId, so we don't need
        // a separate call to $removeFootnoteReferenceNodeByReferenceId
      },
      { discrete: true },
    );
  };

  return (
    <>
      <div className={classNames.orderContainer}>
        <sup className={classNames.order}>{order}</sup>
      </div>
      <LexicalNestedComposer initialEditor={blockNote} initialTheme={theme}>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={twMerge(
                classNames.editor,
                isSelected && classNames.editorFocused,
                !isSelected && classNames.editorStatic,
              )}
            />
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
      <button className={classNames.delete} type="button" onClick={onSubmit}>
        <XIcon />
      </button>
    </>
  );
};

export default FootnoteBlockComponent;
