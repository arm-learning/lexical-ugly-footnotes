import { $dfs } from "@lexical/utils";
import {
	$getChildCaretOrSelf,
	$getNodeByKey,
	$getRoot,
	$getSiblingCaret,
	type CaretDirection,
	type LexicalEditor,
	type LexicalNode,
	type NodeCaret,
} from "lexical";
import {
	REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND,
	UPDATE_FOOTNOTE_ORDERS_COMMAND,
} from "../shared/constants/commands.js";
// Import from CLIENT nodes (for node creation)
import { FootnoteReferenceNode } from "../nodes/ReferenceNode.client.js";
import { $createFootnoteBlockNode } from "../nodes/BlockNode.client.js";
import { $createFootnoteLineBreakNode, type FootnoteLineBreakNode } from "../nodes/LineBreakNode.client.js";
// Import from base for type guards and base classes
import { $isFootnoteLineBreakNode } from "../shared/nodes/LineBreak.base.js";
import { $isFootnoteBlockNode, type FootnoteBlockBase } from "../shared/nodes/Block.base.js";
import { footnoteService } from "../shared/service.js";
import { isContainerNode, containerConfig } from "./index.js";

// ============================================================================
// Functions that CREATE nodes (client-only)
// ============================================================================

export function $reorderFootnoteBlocksFromService(): void {
	const root = $getRoot();

	const ids = footnoteService.getDocOrderIds();
	// If no footnotes: remove delimiter + all blocks and bail
	if (ids.length === 0) {
		const delim = root.getChildren().find($isFootnoteLineBreakNode);
		if (delim) delim.remove();
		for (const { node } of $dfs(root)) {
			if ($isFootnoteBlockNode(node)) node.remove();
		}
		return;
	}

	// Ensure delimiter exists
	let delim = root.getChildren().find($isFootnoteLineBreakNode) as
		| FootnoteLineBreakNode
		| undefined;
	if (!delim) {
		delim = $createFootnoteLineBreakNode();
		root.append(delim);
	}

	// Index any existing blocks by id BEFORE removing them
	const byId = new Map<string, FootnoteBlockBase<unknown>>();
	const dupBuckets = new Map<string, FootnoteBlockBase<unknown>[]>();
	for (const { node } of $dfs(root)) {
		if ($isFootnoteBlockNode(node)) {
			const id = node.getReferenceId();
			if (!id) continue;
			const first = byId.get(id);
			if (!first) byId.set(id, node);
			else {
				// collect duplicates to remove after
				const arr = dupBuckets.get(id) ?? [];
				arr.push(node);
				dupBuckets.set(id, arr);
			}
		}
	}

	// Remove ALL block nodes from the tree (kept instances live in byId)
	for (const { node } of $dfs(root)) {
		if ($isFootnoteBlockNode(node)) node.remove();
	}

	// Also remove duplicates we saw
	for (const arr of dupBuckets.values()) {
		for (const dup of arr) dup.remove();
	}

	// Reinsert in authoritative order
	if (!delim) return; // Should not happen, but satisfy linter
	let cursor: FootnoteLineBreakNode | FootnoteBlockBase<unknown> = delim;
	ids.forEach((id, idx) => {
		const order = idx + 1;
		const node = byId.get(id) ?? $createFootnoteBlockNode(id, order);
		node.setOrder(order); // ensure node.order matches service
		cursor.insertAfter(node); // attaches (or moves) the node
		cursor = node;
	});
}

let _isSyncing = false;

export function $syncFootnotesInParent(): void {
	if (_isSyncing) return;
	_isSyncing = true;
	try {
		$reorderFootnoteBlocksFromService();

		const allowed = new Set(footnoteService.getDocOrderIds());
		footnoteService.pruneToIds(allowed);
	} finally {
		_isSyncing = false;
	}
}

export function $removeFootnoteById(referenceId: string) {
	// 1) Remove nodes from the document (both block and all refs with this id)
	for (const { node } of $dfs($getRoot())) {
		if (
			($isFootnoteBlockNode(node) ||
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

// export function $removeFootnoteByBlockNodeKey(blockNodeKey: string) {
// 	const block = $getNodeByKey(blockNodeKey);
// 	if (!$isFootnoteBlockNode(block)) return;
// 	const id = block.getReferenceId();
// 	if (id) $removeFootnoteById(id);
// }

export function $removeFootnoteByRefNodeKey(refNodeKey: string) {
	const ref = $getNodeByKey(refNodeKey) as FootnoteReferenceNode | null;
	const id = ref?.getReferenceId?.();
	if (id) $removeFootnoteById(id);
}

// ============================================================================
// Functions that traverse and update orders (client-only, uses commands)
// ============================================================================

export function $reorderAllReferencesFromService(): void {
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
			if (!referenceId) continue;
			const idx = footnoteService.indexOf(referenceId);
			if (idx !== undefined) {
				nodeAt.setOrder(idx + 1);
				if (footnoteService.hasBlock(referenceId)) {
					footnoteService.upsertBlock(referenceId, idx + 1);
				}
			}
		}

		// Found a nested editor (container)
		if (isContainerNode(nodeAt)) {
			const containerEditor = containerConfig?.getNestedEditor?.(nodeAt);
			if (!containerEditor) continue;
			containerEditor.dispatchCommand(UPDATE_FOOTNOTE_ORDERS_COMMAND, undefined);
		}
	}
}
