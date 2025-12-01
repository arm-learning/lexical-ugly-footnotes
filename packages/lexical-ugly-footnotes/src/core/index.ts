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
import { FootnoteReferenceNode } from "../nodes/ReferenceNode.js";
import { REMOVE_FOOTNOTE_REFERENCE_NODE_BY_REFERENCE_ID_COMMAND, UPDATE_FOOTNOTE_ORDERS_COMMAND } from "../plugins/NestedFootnotePlugin.js";
import { $createFootnoteBlockNode, FootnoteBlockNode } from "../nodes/BlockNode.js";
import { $createFootnoteLineBreakNode, $isFootnoteLineBreakNode, type FootnoteLineBreakNode } from "../nodes/LineBreakNode.js";

export type RefId = string;

export interface FootnoteRef {
	id: RefId;
	order: number;
}
export interface FootnoteBlock {
	id: RefId;
	order: number;
}

export class FootnoteService {
	// canonical state
	private refs = new Map<RefId, FootnoteRef>();
	private blocks = new Map<RefId, FootnoteBlock>();

	// doc-order cache (IDs only)
	private docOrderIds: RefId[] = [];
	private idToIndex = new Map<RefId, number>(); // 0-based index into docOrderIds

	/** ————— basics ————— */

	clear() {
		this.refs.clear();
		this.blocks.clear();
		this.docOrderIds = [];
		this.idToIndex.clear();
	}

	getReferencesSorted(): FootnoteRef[] {
		return Array.from(this.refs.values()).sort((a, b) => a.order - b.order);
	}
	getBlocksSorted(): FootnoteBlock[] {
		return Array.from(this.blocks.values()).sort((a, b) => a.order - b.order);
	}

	/** ————— doc-order index ————— */

	/** Replace the entire doc-order (IDs only) and mirror orders into refs/blocks */
	setDocOrder(ids: RefId[]) {
		this.docOrderIds = ids.slice();
		this.idToIndex.clear();
		ids.forEach((id, i) => this.idToIndex.set(id, i));

		// mirror 1-based order into refs/blocks
		ids.forEach((id, i) => {
			const order = i + 1;
			const r = this.refs.get(id);
			if (r) this.refs.set(id, { ...r, order });
			const b = this.blocks.get(id);
			if (b) this.blocks.set(id, { ...b, order });
		});
	}

	getDocOrderIds(): RefId[] {
		return this.docOrderIds;
	}
	indexOf(id: RefId): number | undefined {
		return this.idToIndex.get(id);
	}
	/** Next 1-based order immediately after prevId; if none, returns 1 */
	nextOrderAfter(prevId?: RefId | null): number {
		if (!prevId) return 1;
		const i = this.idToIndex.get(prevId);
		return i === undefined ? 1 : i + 2; // index 0 => order 1, “after” => +2
	}

	/** Insert a new id at a 1-based order, shifting others */
	insertIntoDocOrderAt(id: RefId, order: number) {
		const pos = Math.max(0, Math.min(order - 1, this.docOrderIds.length));
		this.docOrderIds.splice(pos, 0, id);
		this.setDocOrder(this.docOrderIds);
	}

	/** Remove an id from doc-order (and mirror) */
	removeFromDocOrder(id: RefId) {
		const i = this.idToIndex.get(id);
		if (i === undefined) return;
		this.docOrderIds.splice(i, 1);
		this.setDocOrder(this.docOrderIds);
	}

	/** ————— high-level mutations ————— */

	/** Upsert a reference; if order provided, shift others accordingly */
	upsertReference(id: RefId, order?: number): number {
		if (order === undefined) {
			// append at end in doc-order
			this.docOrderIds.push(id);
			this.setDocOrder(this.docOrderIds);
			this.refs.set(id, { id, order: this.docOrderIds.length });
			return this.docOrderIds.length;
		}
		// place at specific 1-based position
		this.insertIntoDocOrderAt(id, order);
		const final = this.indexOf(id)! + 1;
		this.refs.set(id, { id, order: final });
		return final;
	}

	/** Upsert a block; default to its reference’s order */
	upsertBlock(id: RefId, order?: number): number {
		const ref = this.refs.get(id);
		const final = order ?? ref?.order ?? this.indexOf(id)! + 1;
		this.blocks.set(id, { id, order: final });
		return final;
	}

	/** Remove both ref and block, shifting everything down */
	removeRefAndBlock(id: RefId) {
		this.refs.delete(id);
		this.blocks.delete(id);
		this.removeFromDocOrder(id); // re-numbers remaining items
	}

	/** Orphan-clean helpers, if you want them */
	getOrphanedRefs(): RefId[] {
		return Array.from(this.refs.values())
			.filter((r) => !this.blocks.has(r.id))
			.map((r) => r.id);
	}
	getOrphanedBlocks(): RefId[] {
		return Array.from(this.blocks.values())
			.filter((b) => !this.refs.has(b.id))
			.map((b) => b.id);
	}
	hasBlock(id: RefId): boolean {
		return this.blocks.has(id);
	}
	hasReference(id: RefId): boolean {
		return this.refs.has(id);
	}

	cleanup(): void {
		// Remove orphaned references
		const orphanedRefs = this.getOrphanedRefs();
		for (const id of orphanedRefs) {
			this.refs.delete(id);
			this.removeFromDocOrder(id);
		};

		// Remove orphaned blocks
		const orphanedBlocks = this.getOrphanedBlocks();
		for (const id of orphanedBlocks) {
			this.blocks.delete(id);
			this.removeFromDocOrder(id);
		};
	}
	/** Remove any ref/block entries whose ids are not in `allowedIds`.
      DOES NOT touch docOrderIds/idToIndex. */
	pruneToIds(allowedIds: Set<RefId>) {
		for (const id of Array.from(this.refs.keys())) {
			if (!allowedIds.has(id)) this.refs.delete(id);
		}
		for (const id of Array.from(this.blocks.keys())) {
			if (!allowedIds.has(id)) this.blocks.delete(id);
		}
	}

	debug() {
		console.log({
			refs: this.refs,
			blocks: this.blocks,
			docOrderIds: this.docOrderIds,
			idToIndex: this.idToIndex,
		});
	}
}

export const footnoteService = new FootnoteService();

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
): FootnoteReferenceNode | null {
	let n: LexicalNode | null = anchorNode;
	while (n) {
		n = $prevInDocument(n);
		if (!n) break;
		if (n instanceof FootnoteReferenceNode) return n;
	}
	return null;
}

/** rebuild the doc-order index (IDs only) & mirror numbers into nodes/service */
export function $rebuildFootnoteDocIndex(): void {
	const refs: { id: string; node: FootnoteReferenceNode }[] = [];
	const root = $getRoot();
	const nodes = $dfs(root);
	for (const { node } of nodes) {
		if (node instanceof FootnoteReferenceNode) {
			const id = node.getReferenceId();
			if (!id) {
				throw new Error("FootnoteReferenceNode has no reference ID");
			}
			// if (!id) {
			//     id = node.getKey();
			//     node.setReferenceId(id);
			// } // fallback
			refs.push({ id, node });
		}
	}
	// sort by structural position
	refs.sort((a, b) => (a.node.isBefore(b.node) ? -1 : 1)); // Lexical 0.13+ has isBefore; if not, swap to a path-compare helper

	footnoteService.setDocOrder(refs.map((r) => r.id));
	refs.forEach((r, i) => r.node.setOrder(i + 1));
}

export interface FootnoteContainerConfig<TContainer extends LexicalNode = LexicalNode> {
	containerNodeClass?: new (...args: unknown[]) => TContainer;
	getNestedEditor?: (node: TContainer) => LexicalEditor | null;
}

// biome-ignore lint: any
let containerConfig: FootnoteContainerConfig<any> | null = null;

export function configureFootnoteContainer<TContainer extends LexicalNode>(
	config: FootnoteContainerConfig<TContainer>,
): void {
	containerConfig = config;
}

const isContainerNode = <TContainer extends LexicalNode>(node: LexicalNode): node is TContainer => {
	if (!containerConfig?.containerNodeClass) return false;
	return node instanceof containerConfig.containerNodeClass;
};

/** next order computed from the nearest previous ref using the index */
export function $nextFootnoteOrderWithIndex(anchorNode: LexicalNode): number {
	const prev = $findPrevFootnoteRefWithNodeCaret(anchorNode);
	return footnoteService.nextOrderAfter(prev ?? null);
}

/**
 * Depth-first walk in the 'previous' direction, starting just before `origin`.
 * Returns the first FootnoteReferenceNode encountered, or null.
 */
// export function $findPrevFootnoteRefWithNodeCaret(
// 	origin: LexicalNode,
// ): FootnoteReferenceNode | null {
// 	// Start a caret that points LEFT of the origin.
// 	// Wrap with ChildCaret so if that previous thing is an Element,
// 	// we immediately "enter" it at its last child.
// 	let caret: NodeCaret<"previous"> | null = $getChildCaretOrSelf(
// 		$getSiblingCaret(origin, "previous"),
// 	);

// 	// Adjacent-caret walk with "enter children if element" strategy.
// 	// const step = (c: any) => {
// 	function step<D extends CaretDirection>(
// 		prevCaret: NodeCaret<D>,
// 	): null | NodeCaret<D> {
// 		// Get the adjacent SiblingCaret
// 		const nextCaret = prevCaret.getAdjacentCaret();
// 		return (
// 			// If there is a sibling, try and get a ChildCaret from it
// 			nextCaret?.getChildCaret() ||
// 			// Return the sibling if there is one
// 			nextCaret ||
// 			// Return a SiblingCaret of the parent, if there is one
// 			prevCaret.getParentCaret("root")
// 		);
// 	}

// 	for (; caret !== null; caret = step(caret)) {
// 		const nodeAt = caret.getNodeAtCaret(); // the node the caret points to
// 		if (!nodeAt) continue;
// 		if (nodeAt instanceof FootnoteReferenceNode) return nodeAt;
// 		if (nodeAt instanceof FrameNode) {
// 			const frame = nodeAt.getFrame();
// 			let foundInFrame: FootnoteReferenceNode | null = null;
// 			frame.getEditorState().read(() => {
// 				const childRoot = $getRoot();
// 				const lastChild = childRoot.getLastChild();
// 				if (lastChild) {
// 					const prev = $findPrevFootnoteRefWithNodeCaret(lastChild);
// 					if (prev) foundInFrame = prev;
// 				}
// 			});
// 			if (foundInFrame) return foundInFrame;
// 		}
// 	}
// 	return null;
// }

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
	// const step = (c: any) => {
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
		if (nodeAt instanceof FootnoteReferenceNode) {
			return nodeAt.getReferenceId();
		}
		// if (nodeAt instanceof FrameNode) {
		// 	const frame = nodeAt.getFrame();
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

// export function $nextFootnoteOrderWithIndexFromNested(anchorNode: LexicalNode): number {
// 	const prev = $findPrevFootnoteRefWithNodeCaret(anchorNode);
// 	return footnoteService.nextOrderAfter(prev?.getReferenceId() ?? null);
// }

// export function $reorderFootnoteBlocksFromService(): void {
// 	console.log("reorder footnote blocks from service")
// 	footnoteService.debug();
// 	const root = $getRoot();

// 	// // if no refs at all, remove delimiter + any blocks
// 	// const hasAnyRef = $dfs(root).some(
// 	// 	({ node }) => node instanceof FootnoteReferenceNode,
// 	// );
// 	let delim = root.getChildren().find($isFootnoteLineBreakNode) as
// 		| FootnoteLineBreakNode
// 		| undefined;

// 		const currentBlocks = footnoteService.getBlocksSorted();
// 		console.log({currentBlocks})
// 	if (currentBlocks.length === 0) {
// 		if (delim) delim.remove();
// 		for (const { node } of $dfs(root))
// 			if (node instanceof FootnoteBlockNode) node.remove();
// 		return;
// 	}

// 	if (!delim) {
// 		delim = $createFootnoteLineBreakNode();
// 		root.append(delim);
// 	}

// 	// index existing blocks by referenceId
// 	const existing = new Map<string, FootnoteBlockNode>();
// 	console.log({existing})
// 	for (const { node } of $dfs(root)) {
// 		if (node instanceof FootnoteBlockNode) {
// 			const id = node.getReferenceId();
// 			if (id) existing.set(id, node);
// 		}
// 	}

// 	console.log({existing})
// 	// walk service order and ensure blocks line up; move or create as needed
// 	let cursor: FootnoteLineBreakNode | FootnoteBlockNode = delim;
// 	const ids = footnoteService.getDocOrderIds();
// 	console.log({ids})
// 	ids.forEach((id, idx) => {
// 		const desiredOrder = idx + 1;
// 		console.log({desiredOrder})
// 		let block = existing.get(id);
// 		console.log({block})
// 		if (!block) {
// 			block = $createFootnoteBlockNode(id, desiredOrder);
// 			console.log({cursor})
// 			console.log(block.getOrder())
// 			cursor.insertAfter(block);
// 			cursor = block;
// 			console.log({newBlock: block})
// 			return;
// 		}

// 		// update the block's order to the authoritative one
// 		if (block.getOrder() !== desiredOrder) {
// 			console.log('updating block order')
// 			block.setOrder(desiredOrder);
// 		}

// 		// if it's already right after cursor, leave it; otherwise move it
// 		const next = cursor.getNextSibling();
// 		console.log({next})
// 		if (next !== block) {
// 			cursor.insertAfter(block); // moves the existing node
// 			console.log({movedBlock: block})
// 		}
// 		cursor = block;
// 	});

// 	console.log("reorder footnote blocks from service done")
// 	footnoteService.debug();
// 	// // any extra blocks whose ids aren’t in service should be removed
// 	// for (const [id, block] of existing) {
// 	// 	if (!footnoteService.indexOf(id) && footnoteService.indexOf(id) !== 0) {
// 	// 		console.log({removedBlock: block})
// 	// 		block.remove();
// 	// 	}
// 	// }
// }

export function $reorderFootnoteBlocksFromService(): void {
	const root = $getRoot();

	const ids = footnoteService.getDocOrderIds();
	// If no footnotes: remove delimiter + all blocks and bail
	if (ids.length === 0) {
		const delim = root.getChildren().find($isFootnoteLineBreakNode);
		if (delim) delim.remove();
		for (const { node } of $dfs(root)) {
			if (node instanceof FootnoteBlockNode) node.remove();
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
	const byId = new Map<string, FootnoteBlockNode>();
	const dupBuckets = new Map<string, FootnoteBlockNode[]>();
	for (const { node } of $dfs(root)) {
		if (node instanceof FootnoteBlockNode) {
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
		if (node instanceof FootnoteBlockNode) node.remove();
	}

	// Also remove duplicates we saw
	for (const arr of dupBuckets.values()) {
		for (const dup of arr) dup.remove();
	}

	// Reinsert in authoritative order
	let cursor: FootnoteLineBreakNode | FootnoteBlockNode = delim!;
	ids.forEach((id, idx) => {
		const order = idx + 1;
		const node = byId.get(id) ?? $createFootnoteBlockNode(id, order);
		node.setOrder(order); // ensure node.order matches service
		cursor.insertAfter(node); // attaches (or moves) the node
		cursor = node;
	});
}

let _isSyncing = false;

// export function $syncFootnoteIndex(): void {
// 	if (_isSyncing) return;
// 	_isSyncing = true;
// 	try {
// 		$rebuildFootnoteDocIndex();
// 		$reorderFootnoteBlocksFromService();
// 		const allowed = new Set(footnoteService.getDocOrderIds());
// 		footnoteService.pruneToIds(allowed);
// 	} finally {
// 		_isSyncing = false;
// 	}
// }

export function $syncFootnotesInParent(): void {
	if (_isSyncing) return;
	_isSyncing = true;
	try {
		// If your rebuild scans only the parent, keep it here.
		// If you use composed traversal across children, also keep it here.
		//   $rebuildFootnoteDocIndex();           // <-- PARENT context only

		$reorderFootnoteBlocksFromService(); // <-- PARENT only (child doesn't have these nodes)

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
	// $syncFootnoteIndex();
	$syncFootnotesInParent();
}

//   export function $removeFootnoteByRefNodeKey

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

/** Walk left using NodeCaret; return first FootnoteReferenceNode or null */
// function $findPrevRef(node: LexicalNode): FootnoteReferenceNode | null {
// 	// console.log("find prev ref")
// 	// console.log({node})
// 	let caret: NodeCaret<"previous"> | null =
// 	  $getChildCaretOrSelf($getSiblingCaret(node, "previous"));
// 	// console.log({caret})
// 	function step<D extends CaretDirection>(c: NodeCaret<D>): NodeCaret<D> | null {
// 	  const next = c.getAdjacentCaret();
// 	  console.log({next})
// 	  return next?.getChildCaret() || next || c.getParentCaret("root");
// 	}

// 	for (; caret !== null; caret = step(caret)) {
// 	  const at = caret.getNodeAtCaret();
// 	  console.log({at})
// 	  if (at instanceof FootnoteReferenceNode) return at;
// 	}
// 	return null;
//   }

/** Count refs strictly before node within *this* editor */
function $countPrevRefsInThisEditor(node: LexicalNode): number {
	// console.log("count prev refs in this editor")
	// console.log({node})
	let count = 0;
	let caret: NodeCaret<"previous"> | null = $getChildCaretOrSelf(
		$getSiblingCaret(node, "previous"),
	);

	//   console.log({caret})
	function step<D extends CaretDirection>(
		c: NodeCaret<D>,
	): NodeCaret<D> | null {
		const next = c.getAdjacentCaret();
		//   console.log({next})
		return next?.getChildCaret() || next || c.getParentCaret("root");
	}

	for (; caret !== null; caret = step(caret)) {
		const at = caret.getNodeAtCaret();
		//   console.log({at})
		if (at instanceof FootnoteReferenceNode) count++;
	}
	return count;
}

export function nextOrderForChildInsertion(
	childAnchor: LexicalNode,
	parentEditor: LexicalEditor,
	containerNodeKey: string,
): number {
	// console.log("next order for child insertion")
	// console.log({childAnchor})
	// console.log({parentEditor})
	// console.log({containerNodeKey})
	// 1) how many refs exist *before the caret* inside this child?
	const beforeInChild = $countPrevRefsInThisEditor(childAnchor);

	// console.log({beforeInChild})
	// 2) base from parent: next order *before* entering the container
	let base = 1;

	parentEditor.getEditorState().read(() => {
		const container = $getNodeByKey(containerNodeKey);
		//   console.log({container})
		if (!container) {
			base = 1;
			return;
		}
		//   const prevInParent = $findPrevRef(container);
		const refId = $findPrevFootnoteRefWithNodeCaret(container);
		//   console.log({prevInParent})
		//   const prevId = prevInParent?.getReferenceId() ?? null;
		//   console.log({prevId})
		base = footnoteService.nextOrderAfter(refId); // O(1) from your service index
		//   console.log({base})
	});

	// 3) final
	return base + beforeInChild;
}

export function $mirrorOrdersFromServiceIntoCurrentEditor(): void {
	for (const { node } of $dfs($getRoot())) {
		if (node instanceof FootnoteReferenceNode) {
			const id = node.getReferenceId();
			if (!id) continue;
			const idx = footnoteService.indexOf(id);
			if (idx !== undefined) node.setOrder(idx + 1);
		}
	}
}
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
//   TODO: Determine how to increment next footnotes
// TODO: Add footnote blocks on nested insertion

// // type guards you already have
const isParentRef = (n: LexicalNode): n is FootnoteReferenceNode =>
	n instanceof FootnoteReferenceNode;
// const isContainerNode = (n: LexicalNode): n is FrameNode /* or your type */ =>
// 	n instanceof FrameNode; // adjust for your container type
// const isContainerNode2 = <T extends LexicalNode>(n: LexicalNode, type: new () => T): n is T /* or your type */ =>
// 	n instanceof type; // adjust for your container type
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
