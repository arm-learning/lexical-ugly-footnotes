import type { NodeKey } from "lexical";

export interface ReferenceComponentProps {
    referenceId: string | null;
    nodeKey: NodeKey;
    order: number | null;
}