import type { DOMConversionMap, EditorConfig, LexicalEditor, NodeKey } from "lexical";
import type React from "react";
import type { ComponentType } from "react";
import FootnoteBlockComponent from "../components/BlockComponent.js";
import { BLOCK_ATTR } from "../shared/constants/block.js";
import {
	FootnoteBlockBase,
	createConvertFootnoteBlockElement,
	createNestedEditor,
	type SerializedFootnoteBlockNode,
} from "../shared/nodes/Block.base.js";
import { BLOCK_TYPE } from "../shared/constants/block.js";
import { getBlockClasses } from "../theme/index.js";
import type { BlockComponentProps } from "../types/block.js";

// Re-export types and theme from base
export {
	theme,
	type SerializedBlockNote,
	type SerializedFootnoteBlockNode,
} from "../shared/nodes/Block.base.js";

// ============================================================================
// Client Node Class
// ============================================================================

export class FootnoteBlockNode extends FootnoteBlockBase<React.ReactNode> {
	static getType(): string {
		return BLOCK_TYPE;
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

	component(): ComponentType<BlockComponentProps> | null {
		return FootnoteBlockComponent;
	}

	decorate(editor: LexicalEditor, config: EditorConfig): React.ReactNode {
		const Component = this.component();
		if (!Component) return null;
		const referenceId = this.getReferenceId();
		const order = this.getOrder();
		const classes = getBlockClasses(config);
		return (
			<Component
				nodeKey={this.getKey()}
				referenceId={referenceId}
				order={order}
				blockNote={this.__blockNote}
				classNames={classes}
			/>
		);
	}
}

// ============================================================================
// Client-specific helpers
// ============================================================================

export const convertFootnoteBlockElement = createConvertFootnoteBlockElement(
	(referenceId, order, blockNote) => $createFootnoteBlockNode(referenceId, order, blockNote),
);

let BlockNodeClass: typeof FootnoteBlockNode = FootnoteBlockNode;

export const registerBlockNodeClass = (klass: typeof FootnoteBlockNode) => {
	BlockNodeClass = klass;
};

export const $createFootnoteBlockNode = (
	referenceId?: string,
	order?: number,
	blockNote?: LexicalEditor,
): FootnoteBlockNode => {
	const editor = blockNote ?? createNestedEditor();
	const node = new BlockNodeClass();
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
