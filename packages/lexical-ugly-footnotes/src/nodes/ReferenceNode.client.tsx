import type { DOMConversionMap, EditorConfig, LexicalEditor, NodeKey } from "lexical";
import type React from "react";
import type { ComponentType } from "react";
import FootnoteReferenceComponent from "../components/ReferenceComponent.js";
import { REFERENCE_ATTR } from "../shared/constants/reference.js";
import {
	FootnoteReferenceBase,
	createConvertFootnoteReferenceElement,
	type SerializedFootnoteReferenceNode,
} from "../shared/nodes/Reference.base.js";
import { getReferenceClasses } from "../theme/index.js";
import type { ReferenceComponentProps } from "../types/reference.js";

// Re-export types from base
export type { SerializedFootnoteReferenceNode } from "../shared/nodes/Reference.base.js";

// ============================================================================
// Client Node Class
// ============================================================================

export class FootnoteReferenceNode extends FootnoteReferenceBase<React.ReactNode> {
	constructor(
		referenceId?: string | null,
		order?: number | null,
		key?: NodeKey,
	) {
		super(referenceId, order, key);
	}

	static clone(node: FootnoteReferenceNode): FootnoteReferenceNode {
		return new FootnoteReferenceNode(
			node.getReferenceId(),
			node.getOrder(),
			node.getKey(),
		);
	}

	static importDOM(): DOMConversionMap | null {
		return {
			span: (domNode: Node) => {
				if (
					domNode instanceof HTMLSpanElement &&
					domNode.hasAttribute(REFERENCE_ATTR.container)
				) {
					return {
						conversion: convertFootnoteReferenceElement,
						priority: 1,
					};
				}
				return null;
			},
		};
	}

	static importJSON(
		serializedNode: SerializedFootnoteReferenceNode,
	): FootnoteReferenceNode {
		return $createFootnoteReferenceNode().updateFromJSON(serializedNode);
	}

	component(): ComponentType<ReferenceComponentProps> | null {
		return FootnoteReferenceComponent;
	}

	decorate(editor: LexicalEditor, config: EditorConfig): React.ReactNode {
		const Component = this.component();
		if (!Component) return null;

		const referenceId = this.getReferenceId();
		const order = this.getOrder();
		const classes = getReferenceClasses(config);

		return (
			<Component
				referenceId={referenceId}
				nodeKey={this.getKey()}
				order={order}
				classNames={classes}
			/>
		);
	}
}

// ============================================================================
// Client-specific helpers
// ============================================================================

export const convertFootnoteReferenceElement = createConvertFootnoteReferenceElement(
	() => $createFootnoteReferenceNode(),
);

let ReferenceNodeClass: typeof FootnoteReferenceNode = FootnoteReferenceNode;

export const registerReferenceNodeClass = (klass: typeof FootnoteReferenceNode) => {
	ReferenceNodeClass = klass;
};

export const $createFootnoteReferenceNode = (
	referenceId?: string | null,
	order?: number | null,
	key?: NodeKey,
): FootnoteReferenceNode => {
	const node = new ReferenceNodeClass(referenceId, order, key);
	if (referenceId) {
		node.setReferenceId(referenceId);
	}
	if (typeof order === "number") {
		node.setOrder(order);
	}
	return node;
};

// Re-export $isFootnoteReferenceNode from base
export { $isFootnoteReferenceNode } from "../shared/nodes/Reference.base.js";
