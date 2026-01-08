import {
	type DOMConversionMap,
	type LexicalEditor,
	type NodeKey,
} from "lexical";
import { BLOCK_ATTR } from "../shared/constants/block.js";
import {
	FootnoteBlockBase,
	createConvertFootnoteBlockElement,
	createNestedEditor,
	type SerializedFootnoteBlockNode,
} from "../shared/nodes/Block.base.js";

// Re-export types and theme from base
export {
	theme,
	type SerializedBlockNote,
	type SerializedFootnoteBlockNode,
} from "../shared/nodes/Block.base.js";

// ============================================================================
// Server Node Class
// ============================================================================

export class FootnoteBlockNode extends FootnoteBlockBase<null> {
	constructor(referenceId?: string, blockNote?: LexicalEditor, key?: NodeKey) {
		super(referenceId, blockNote, key);
	}

	static clone(node: FootnoteBlockNode): FootnoteBlockNode {
		return new FootnoteBlockNode(
			node.__referenceId,
			node.__blockNote,
			node.__key,
		);
	}

	static importDOM(): DOMConversionMap | null {
		return {
			div: (domNode: Node) => {
				if (
					domNode instanceof HTMLDivElement &&
					domNode.hasAttribute(BLOCK_ATTR.container)
				) {
					return {
						conversion: convertFootnoteBlockElement,
						priority: 1,
					};
				}
				return null;
			},
		};
	}

	static importJSON(
		serializedNode: SerializedFootnoteBlockNode,
	): FootnoteBlockNode {
		return $createFootnoteBlockNode().updateFromJSON(serializedNode);
	}

	decorate(): null {
		return null;
	}
}

// ============================================================================
// Server-specific helpers
// ============================================================================

export const convertFootnoteBlockElement = createConvertFootnoteBlockElement(
	(referenceId, order, blockNote) => $createFootnoteBlockNode(referenceId, order, blockNote),
);

export const $createFootnoteBlockNode = (
	referenceId?: string,
	order?: number,
	blockNote?: LexicalEditor,
): FootnoteBlockNode => {
	const editor = blockNote ?? createNestedEditor();
	const node = new FootnoteBlockNode();
	if (referenceId) {
		node.setReferenceId(referenceId);
	}
	node.setBlockNoteFromEditor(editor);
	if (order) {
		node.setOrder(order);
	}
	return node;
};

// Re-export $isFootnoteBlockNode from base
export { $isFootnoteBlockNode } from "../shared/nodes/Block.base.js";
