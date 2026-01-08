import type { LexicalEditor, NodeKey } from "lexical";
import type { BlockCssClassNames } from "../theme/index.js";

export interface BlockComponentProps {
    referenceId: string | null;
    nodeKey: NodeKey;
    order: number | null;
    blockNote: LexicalEditor;
    sharedHistoryState?: boolean;
    classNames: Required<BlockCssClassNames>;
}