import { $dfs } from "@lexical/utils";
import { $getNodeByKey, $getRoot } from "lexical";
import { footnoteService } from "./index.js";
import { FootnoteBlockNode } from "../nodes/BlockNode.js";
import { FootnoteReferenceNode } from "../nodes/ReferenceNode.js";
import { $syncFootnotesInParent } from "./index.js";

export function $removeFootnoteById(referenceId: string) {
    // 1) Remove nodes from the document (both block and all refs with this id)
    for (const { node } of $dfs($getRoot())) {
        if (
            (node instanceof FootnoteBlockNode ||
                node instanceof FootnoteReferenceNode) &&
            node.getReferenceId?.() === referenceId
        ) {
            node.remove();
        }
    }

    // 2) Update the service (this also shifts/renumbers its index)
    footnoteService.removeRefAndBlock(referenceId);

    // 3) Rebuild index & reflow blocks from the remaining refs
    $syncFootnotesInParent();
}

export function $removeFootnoteByBlockNodeKey(blockNodeKey: string) {
    const block = $getNodeByKey(blockNodeKey) as FootnoteBlockNode | null;
    const id = block?.getReferenceId?.();
    if (id) $removeFootnoteById(id);
}

export function $removeFootnoteByBlockNodeKeyTwo(blockNodeKey: string) {
    const block = $getNodeByKey(blockNodeKey) as FootnoteBlockNode | null;
    const id = block?.getReferenceId?.();
    if (!id) return;
    footnoteService.removeRefAndBlock(id);
    $removeFootnoteById(id);
}
export function $removeFootnoteByRefNodeKey(refNodeKey: string) {
    const ref = $getNodeByKey(refNodeKey) as FootnoteReferenceNode | null;
    const id = ref?.getReferenceId?.();
    if (id) $removeFootnoteById(id);
}
