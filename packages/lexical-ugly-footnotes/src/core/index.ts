import { $dfs } from "@lexical/utils";
import {
	$getChildCaretOrSelf,
	$getNodeByKey,
	$getRoot,
	$getSiblingCaret,
	$isElementNode,
	type CaretDirection,
	type LexicalEditor,
	type LexicalNode,
	type NodeCaret,
} from "lexical";
// Import from BASE classes for instanceof checks (works for both server and client nodes)
import { FootnoteReferenceBase, $isFootnoteReferenceNode } from "../shared/nodes/Reference.base.js";
import { FootnoteBlockBase, $isFootnoteBlockNode } from "../shared/nodes/Block.base.js";
import { FootnoteLineBreakBase, $isFootnoteLineBreakNode } from "../shared/nodes/LineBreak.base.js";
import { footnoteService, type RefId, type FootnoteRef, type FootnoteBlock } from "../shared/service.js";

// Re-export shared types and service
export type { RefId, FootnoteRef, FootnoteBlock };
export { footnoteService };

// Re-export type guards from base classes
export { $isFootnoteReferenceNode, $isFootnoteBlockNode, $isFootnoteLineBreakNode };

/** previous node in document (pre-order) */
function $prevInDocument(node: LexicalNode | null): LexicalNode | null {
	if (!node) return null;
	const prev = node.getPreviousSibling();
	if (prev) {
		let n: LexicalNode = prev;
		while ($isElementNode(n) && n.getLastChild()) {
			n = n.getLastChild()!;
		}
		return n;
	}
	return node.getParent();
}

/** walk left until a ref is found */
export function $findPrevFootnoteRefFromNode(
	anchorNode: LexicalNode,
): FootnoteReferenceBase<unknown> | null {
	let n: LexicalNode | null = anchorNode;
	while (n) {
		n = $prevInDocument(n);
		if (!n) break;
		if (n instanceof FootnoteReferenceBase) return n;
	}
	return null;
}

/** rebuild the doc-order index (IDs only) & mirror numbers into nodes/service */
export function $rebuildFootnoteDocIndex(): void {
	const refs: { id: string; node: FootnoteReferenceBase<unknown> }[] = [];
	const root = $getRoot();
	const nodes = $dfs(root);
	for (const { node } of nodes) {
		if (node instanceof FootnoteReferenceBase) {
			const id = node.getReferenceId();
			if (!id) {
				throw new Error("FootnoteReferenceNode has no reference ID");
			}
			refs.push({ id, node });
		}
	}
	// sort by structural position
	refs.sort((a, b) => (a.node.isBefore(b.node) ? -1 : 1));

	footnoteService.setDocOrder(refs.map((r) => r.id));
	refs.forEach((r, i) => r.node.setOrder(i + 1));
}

export interface FootnoteContainerConfig<TContainer extends LexicalNode = LexicalNode> {
	containerNodeClass?: new (...args: unknown[]) => TContainer;
	getNestedEditor?: (node: TContainer) => LexicalEditor | null;
}

// biome-ignore lint: any
export let containerConfig: FootnoteContainerConfig<any> | null = null;

export function configureFootnoteContainer<TContainer extends LexicalNode>(
	config: FootnoteContainerConfig<TContainer>,
): void {
	containerConfig = config;
}

export const isContainerNode = <TContainer extends LexicalNode>(node: LexicalNode): node is TContainer => {
	if (!containerConfig?.containerNodeClass) return false;
	return node instanceof containerConfig.containerNodeClass;
};

/** next order computed from the nearest previous ref using the index */
export function $nextFootnoteOrderWithIndex(anchorNode: LexicalNode): number {
	const prev = $findPrevFootnoteRefWithNodeCaret(anchorNode);
	return footnoteService.nextOrderAfter(prev ?? null);
}

export function $findPrevFootnoteRefWithNodeCaret(
	origin: LexicalNode,
): string | null {
	// Start a caret that points LEFT of the origin.
	// Wrap with ChildCaret so if that previous thing is an Element,
	// we immediately "enter" it at its last child.
	let caret: NodeCaret<"previous"> | null = $getChildCaretOrSelf(
		$getSiblingCaret(origin, "previous"),
	);

	// Adjacent-caret walk with "enter children if element" strategy.
	function step<D extends CaretDirection>(
		prevCaret: NodeCaret<D>,
	): null | NodeCaret<D> {
		// Get the adjacent SiblingCaret
		const nextCaret = prevCaret.getAdjacentCaret();
		return (
			// If there is a sibling, try and get a ChildCaret from it
			nextCaret?.getChildCaret() ||
			// Return the sibling if there is one
			nextCaret ||
			// Return a SiblingCaret of the parent, if there is one
			prevCaret.getParentCaret("root")
		);
	}

	for (; caret !== null; caret = step(caret)) {
		const nodeAt = caret.getNodeAtCaret(); // the node the caret points to
		if (!nodeAt) continue;
		if (nodeAt instanceof FootnoteReferenceBase) {
			return nodeAt.getReferenceId();
		}
		if (isContainerNode(nodeAt)) {
			const containerEditor = containerConfig?.getNestedEditor?.(nodeAt);
			if (!containerEditor) continue;
			let foundInContainer: string | null = null;
			containerEditor.getEditorState().read(() => {
				const childRoot = $getRoot();
				const lastChild = childRoot.getLastChild();
				if (lastChild) {
					const prev = $findPrevFootnoteRefWithNodeCaret(lastChild);
					if (prev) foundInContainer = prev;
				}
			});
			if (foundInContainer) return foundInContainer;
		}
	}
	return null;
}

export function isEditorActive(editor: LexicalEditor): boolean {
	const root = editor.getRootElement();
	if (!root) return false;
	const doc = root.ownerDocument;
	const active = doc.activeElement;
	// contentEditable focus lives on the root element
	if (active && root.contains(active)) return true;

	// Extra guard: sometimes activeElement is the root, sometimes a shadow/inner node.
	// If you want to be thorough, also check the DOM selection's anchor:
	const domSel = doc.getSelection();
	const anchor = domSel?.anchorNode ?? null;
	return !!anchor && root.contains(anchor);
}

/** Count refs strictly before node within *this* editor */
function $countPrevRefsInThisEditor(node: LexicalNode): number {
	let count = 0;
	let caret: NodeCaret<"previous"> | null = $getChildCaretOrSelf(
		$getSiblingCaret(node, "previous"),
	);

	function step<D extends CaretDirection>(
		c: NodeCaret<D>,
	): NodeCaret<D> | null {
		const next = c.getAdjacentCaret();
		return next?.getChildCaret() || next || c.getParentCaret("root");
	}

	for (; caret !== null; caret = step(caret)) {
		const at = caret.getNodeAtCaret();
		if (at instanceof FootnoteReferenceBase) count++;
	}
	return count;
}

export function nextOrderForChildInsertion(
	childAnchor: LexicalNode,
	parentEditor: LexicalEditor,
	containerNodeKey: string,
): number {
	// 1) how many refs exist *before the caret* inside this child?
	const beforeInChild = $countPrevRefsInThisEditor(childAnchor);

	// 2) base from parent: next order *before* entering the container
	let base = 1;

	parentEditor.getEditorState().read(() => {
		const container = $getNodeByKey(containerNodeKey);
		if (!container) {
			base = 1;
			return;
		}
		const refId = $findPrevFootnoteRefWithNodeCaret(container);
		base = footnoteService.nextOrderAfter(refId);
	});

	// 3) final
	return base + beforeInChild;
}

export function $mirrorOrdersFromServiceIntoCurrentEditor(): void {
	for (const { node } of $dfs($getRoot())) {
		if (node instanceof FootnoteReferenceBase) {
			const id = node.getReferenceId();
			if (!id) continue;
			const idx = footnoteService.indexOf(id);
			if (idx !== undefined) node.setOrder(idx + 1);
		}
	}
}

// type guards
const isParentRef = (n: LexicalNode): n is FootnoteReferenceBase<unknown> =>
	n instanceof FootnoteReferenceBase;

function $countRefsInChild(child: LexicalEditor): number {
	let c = 0;
	child.read(() => {
		for (const { node } of $dfs($getRoot())) {
			if (isParentRef(node)) c++;
		}
	});
	return c;
}

/** Count refs that occur BEFORE `stopAt` in the *parent* DFS order,
 *  splicing in the child refs when we pass a container node. */
function $countRefsBeforeAnchorComposed(
	parentEditor: LexicalEditor,
	stopAt: LexicalNode,
	childRegistry: Map<string /* containerKey */, LexicalEditor>,
): number {
	let count = 0;
	parentEditor.read(() => {
		for (const { node } of $dfs($getRoot())) {
			if (node === stopAt) break;

			if (isParentRef(node)) {
				count++;
				continue;
			}
			if (isContainerNode(node)) {
				const key = node.getKey();
				const child = childRegistry.get(key);
				if (child) count += $countRefsInChild(child);
			}
		}
	});
	return count;
}

export function nextOrderForParentInsertionComposed(
	parentEditor: LexicalEditor,
	anchorNode: LexicalNode,
	childRegistry: Map<string, LexicalEditor>,
): number {
	const countBefore = $countRefsBeforeAnchorComposed(
		parentEditor,
		anchorNode,
		childRegistry,
	);
	return countBefore + 1; // next position
}

function countRefsBeforeCaretInThisChild(childAnchor: LexicalNode): number {
	let c = 0;
	// walk "previous" via NodeCaret, counting real refs in this child
	let caret: NodeCaret<"previous"> | null = $getChildCaretOrSelf(
		$getSiblingCaret(childAnchor, "previous"),
	);
	const step = <D extends CaretDirection>(p: NodeCaret<D>) =>
		p.getAdjacentCaret()?.getChildCaret() ||
		p.getAdjacentCaret() ||
		p.getParentCaret("root");

	for (; caret; caret = step(caret)) {
		const at = caret.getNodeAtCaret();
		if (at && isParentRef(at)) c++;
	}
	return c;
}

export function nextOrderForChildInsertionComposed(
	childAnchor: LexicalNode,
	parentEditor: LexicalEditor,
	containerNodeKey: string,
	childRegistry: Map<string, LexicalEditor>,
): number {
	// 1) base: everything in composed doc before this container
	let base = 0;
	parentEditor.read(() => {
		const container = $getNodeByKey(containerNodeKey);
		if (container) {
			base = $countRefsBeforeAnchorComposed(
				parentEditor,
				container,
				childRegistry,
			);
		}
	});

	// 2) refs before caret inside this child
	const local = countRefsBeforeCaretInThisChild(childAnchor);

	return base + local + 1;
}
