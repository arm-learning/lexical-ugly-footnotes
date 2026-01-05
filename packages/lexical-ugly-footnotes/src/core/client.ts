import {
	$getChildCaretOrSelf,
	$getRoot,
	$getSiblingCaret,
	type CaretDirection,
	type LexicalEditor,
	type LexicalNode,
	type NodeCaret,
} from "lexical";
import { REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND, UPDATE_FOOTNOTE_ORDERS_COMMAND } from "../plugins/NestedFootnotePlugin.js";
import { FootnoteReferenceNode } from "../nodes/ReferenceNode.server.js";
import { footnoteService } from "../shared/service.js";
import { isContainerNode, containerConfig } from "./index.js";

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

		// Found a nested editor (Frame)
		// if (nodeAt instanceof FrameNode) {
		// 	const frame = nodeAt.getFrame();
		if (isContainerNode(nodeAt)) {
			const containerEditor = containerConfig?.getNestedEditor?.(nodeAt);
			if (!containerEditor) continue;
			containerEditor.dispatchCommand(UPDATE_FOOTNOTE_ORDERS_COMMAND, undefined);
			// frame.getEditorState().read(() => {
			//     const childRoot = $getRoot();

			//     // Recursively traverse the nested editor
			//     let childCaret: NodeCaret<"next"> | null = $getChildCaretOrSelf(
			//         $getSiblingCaret(childRoot, "next")
			//     );

			//     function childStep<D extends CaretDirection>(
			//         currentCaret: NodeCaret<D>,
			//     ): null | NodeCaret<D> {
			//         const nextCaret = currentCaret.getAdjacentCaret();
			//         return (
			//             nextCaret?.getChildCaret() ||
			//             nextCaret ||
			//             currentCaret.getParentCaret("root")
			//         );
			//     }

			//     // Traverse the nested editor
			//     for (; childCaret !== null; childCaret = childStep(childCaret)) {
			//         const childNodeAt = childCaret.getNodeAtCaret();
			//         if (!childNodeAt) continue;

			//         if (childNodeAt instanceof FootnoteReferenceNode) {
			//             const referenceId = childNodeAt.getReferenceId();
			//             if (!referenceId) continue;
			//             const idx = footnoteService.indexOf(referenceId);
			//             if (idx !== undefined) childNodeAt.setOrder(idx + 1);
			//         }
			//     }
			// });
		}
	}
}

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
			// if (!referenceId) continue;

			if (referenceId === targetReferenceId) {
				nodeAt.remove();
			}
		}

		// Found a nested editor (Frame)
		// if (nodeAt instanceof FrameNode) {
		// 	const frame = nodeAt.getFrame();
		if (isContainerNode(nodeAt)) {
			const containerEditor = containerConfig?.getNestedEditor?.(nodeAt);
			if (!containerEditor) continue;
			containerEditor.dispatchCommand(
				REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND,
				targetReferenceId,
			);
			// frame.getEditorState().read(() => {
			//     const childRoot = $getRoot();

			//     // Recursively traverse the nested editor
			//     let childCaret: NodeCaret<"next"> | null = $getChildCaretOrSelf(
			//         $getSiblingCaret(childRoot, "next")
			//     );

			//     function childStep<D extends CaretDirection>(
			//         currentCaret: NodeCaret<D>,
			//     ): null | NodeCaret<D> {
			//         const nextCaret = currentCaret.getAdjacentCaret();
			//         return (
			//             nextCaret?.getChildCaret() ||
			//             nextCaret ||
			//             currentCaret.getParentCaret("root")
			//         );
			//     }

			//     // Traverse the nested editor
			//     for (; childCaret !== null; childCaret = childStep(childCaret)) {
			//         const childNodeAt = childCaret.getNodeAtCaret();
			//         if (!childNodeAt) continue;

			//         if (childNodeAt instanceof FootnoteReferenceNode) {
			//             const referenceId = childNodeAt.getReferenceId();
			//             if (!referenceId) continue;
			//             const idx = footnoteService.indexOf(referenceId);
			//             if (idx !== undefined) childNodeAt.setOrder(idx + 1);
			//         }
			//     }
			// });
		}
	}
}

