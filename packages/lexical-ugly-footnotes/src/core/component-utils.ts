import { $dfs } from "@lexical/utils";
import {
  $getChildCaretOrSelf,
  $getNodeByKey,
  $getRoot,
  $getSiblingCaret,
  type CaretDirection,
  type NodeCaret,
} from "lexical";
import { FootnoteReferenceNode } from "../nodes/ReferenceNode.client.js";
import { REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND } from "../shared/constants/commands.js";
import { $isFootnoteBlockNode } from "../shared/nodes/Block.base.js";
import { footnoteService } from "../shared/service.js";
import { containerConfig, isContainerNode } from "./index.js";

/**
 * Remove a footnote by block node key.
 * This function is extracted to avoid circular dependencies with BlockNode.client.tsx
 */
export function $removeFootnoteByBlockNodeKey(blockNodeKey: string) {
  const block = $getNodeByKey(blockNodeKey);
  if (!$isFootnoteBlockNode(block)) return;
  const id = block.getReferenceId();
  if (!id) return;
  $removeFootnoteById(id);
}

/**
 * Remove a footnote by its reference ID.
 * This is a simplified version that doesn't import from core/client.ts to avoid cycles.
 */
function $removeFootnoteById(referenceId: string) {
  // IMPORTANT: Update the service FIRST before removing nodes.
  // This ensures that when the mutation listener fires and calls
  // $reorderFootnoteBlocksFromService(), the service state is already correct.
  footnoteService.removeRefAndBlock(referenceId);

  const root = $getRoot();

  // Remove all block nodes and reference nodes with this id using DFS
  for (const { node } of $dfs(root)) {
    if ($isFootnoteBlockNode(node) && node.getReferenceId() === referenceId) {
      node.remove();
    }
    if (
      node instanceof FootnoteReferenceNode &&
      node.getReferenceId() === referenceId
    ) {
      node.remove();
    }
  }

  // Also handle nested editors
  const caret: NodeCaret<"next"> | null = $getChildCaretOrSelf(
    $getSiblingCaret(root, "next"),
  );

  function step<D extends CaretDirection>(
    currentCaret: NodeCaret<D>,
  ): null | NodeCaret<D> {
    const nextCaret = currentCaret.getAdjacentCaret();
    return (
      nextCaret?.getChildCaret() ||
      nextCaret ||
      currentCaret.getParentCaret("root")
    );
  }

  for (
    let currentCaret: NodeCaret<"next"> | null = caret;
    currentCaret !== null;
    currentCaret = step(currentCaret)
  ) {
    const nodeAt = currentCaret.getNodeAtCaret();
    if (!nodeAt) continue;

    if (isContainerNode(nodeAt)) {
      const containerEditor = containerConfig?.getNestedEditor?.(nodeAt);
      if (!containerEditor) continue;
      containerEditor.dispatchCommand(
        REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND,
        referenceId,
      );
    }
  }
}

/**
 * Remove footnote reference nodes by reference ID.
 * This function is extracted to avoid circular dependencies.
 */
export function $removeFootnoteReferenceNodeByReferenceId(
  targetReferenceId: string,
): void {
  const root = $getRoot();

  // Start at the beginning of the document
  let caret: NodeCaret<"next"> | null = $getChildCaretOrSelf(
    $getSiblingCaret(root, "next"),
  );

  function step<D extends CaretDirection>(
    currentCaret: NodeCaret<D>,
  ): null | NodeCaret<D> {
    // Get the next adjacent position
    const nextCaret = currentCaret.getAdjacentCaret();
    return (
      // If there's a next position and it's an element, enter it
      nextCaret?.getChildCaret() ||
      // Otherwise just use the next position
      nextCaret ||
      // If no next position, try to go up to parent
      currentCaret.getParentCaret("root")
    );
  }
  for (; caret !== null; caret = step(caret)) {
    const nodeAt = caret.getNodeAtCaret();
    if (!nodeAt) continue;

    // Found a footnote reference
    if (nodeAt instanceof FootnoteReferenceNode) {
      const referenceId = nodeAt.getReferenceId();

      if (referenceId === targetReferenceId) {
        nodeAt.remove();
      }
    }

    // Found a nested editor (container)
    if (isContainerNode(nodeAt)) {
      const containerEditor = containerConfig?.getNestedEditor?.(nodeAt);
      if (!containerEditor) continue;
      containerEditor.dispatchCommand(
        REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND,
        targetReferenceId,
      );
    }
  }
}
