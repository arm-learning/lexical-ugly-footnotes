import type { LexicalEditor, NodeKey } from "lexical";

export interface BlockComponentProps {
    referenceId: string | null;
    nodeKey: NodeKey;
    order: number | null;
    blockNote: LexicalEditor;
    sharedHistoryState?: boolean;
}