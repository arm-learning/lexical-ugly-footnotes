import { addClassNamesToElement } from "@lexical/utils";
import {
	DecoratorNode,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	type EditorConfig,
	type LexicalNode,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread,
} from "lexical";
import { footnoteService } from "../shared/service.js";
import { REFERENCE_ATTR, REFERENCE_CLASS, REFERENCE_TYPE } from "../shared/constants/reference.js";

export type SerializedFootnoteReferenceNode = Spread<
	{
		reference_id: string;
		order: number;
	},
	SerializedLexicalNode
>;

const convertFootnoteReferenceElement = (
	domNode: Node,
): DOMConversionOutput | null => {
	if (
		domNode instanceof HTMLSpanElement &&
		domNode.hasAttribute(REFERENCE_ATTR.container)
		// && !domNode.hasAttribute(STUB_ATTR.stub)
	) {
		const referenceId = domNode.getAttribute(REFERENCE_ATTR.referenceId);
		if (!referenceId) {
			throw new Error("Reference ID is required");
		}
		const order = domNode.getAttribute(REFERENCE_ATTR.order);
		if (!order) {
			throw new Error("Order is required");
		}
		if (!footnoteService.hasReference(referenceId)) {
			footnoteService.upsertReference(referenceId, Number.parseInt(order));
		}
		return {
			node: $createFootnoteReferenceNode()
				.setReferenceId(referenceId)
				.setOrder(Number.parseInt(order)),
		};
	}
	return null;
};

export class FootnoteReferenceNode extends DecoratorNode<unknown> {
	__reference_id: string | null;
	__order: number | null;
	constructor(
		referenceId?: string | null,
		order?: number | null,
		key?: NodeKey,
	) {
		super(key);
		this.__reference_id = referenceId ?? null;
		this.__order = order ?? null;
	}

	static getType(): string {
		return REFERENCE_TYPE;
	}

	// isInline(): boolean {
	// 	return true;
	// }

	getReferenceId(): string | null {
		const self = this.getLatest();
		return self.__reference_id;
	}

	setReferenceId(reference_id: string): this {
		const self = this.getWritable();
		self.__reference_id = reference_id;
		return self;
	}

	getKey(): NodeKey {
		const self = this.getLatest();
		return self.__key;
	}

	getOrder(): number | null {
		const self = this.getLatest();
		return self.__order;
	}

	setOrder(order: number): this {
		const self = this.getWritable();
		self.__order = order;
		return self;
	}

	static clone(node: FootnoteReferenceNode): FootnoteReferenceNode {
		const newNode = new FootnoteReferenceNode(
			node.getReferenceId(),
			node.getOrder(),
			node.getKey(),
		);
		return newNode;
	}
	isInline(): boolean {
		return true;
	}

	createDOM(): HTMLElement {
		const span = document.createElement("span");
		span.setAttribute(REFERENCE_ATTR.container, "");

		if (this.__reference_id) {
			span.setAttribute(REFERENCE_ATTR.referenceId, this.__reference_id);
		}
		if (this.__order) {
			span.setAttribute(REFERENCE_ATTR.order, this.__order.toString());
		}
		return span;
	}

	updateDOM(
		prevNode: FootnoteReferenceNode,
		dom: HTMLElement,
		config: EditorConfig,
	): boolean {
		if (
			prevNode.__reference_id !== this.__reference_id ||
			prevNode.__order !== this.__order
		) {
			const referenceId = this.getReferenceId();
			if (referenceId) {
				dom.setAttribute(REFERENCE_ATTR.referenceId, referenceId);
			} else {
				dom.setAttribute(REFERENCE_ATTR.referenceId, "");
			}
			const order = this.getOrder();
			if (order) {
				dom.setAttribute(REFERENCE_ATTR.order, order.toString());
			} else {
				dom.setAttribute(REFERENCE_ATTR.order, "");
			}
			return true;
		}
		return false;
	}

	static importDOM(): DOMConversionMap | null {
		return {
			span: (domNode: Node) => {
				if (
					domNode instanceof HTMLSpanElement &&
					domNode.hasAttribute(REFERENCE_ATTR.container)
					// && !domNode.hasAttribute(STUB_ATTR.stub)
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

	exportDOM(): DOMExportOutput {
		if (!this.__reference_id) {
			throw new Error("Reference ID is required");
		}
		if (!this.__order) {
			throw new Error("Order is required");
		}
		const spanElement = document.createElement("span");
		spanElement.setAttribute(REFERENCE_ATTR.container, "");
		spanElement.setAttribute(REFERENCE_ATTR.referenceId, this.__reference_id);
		spanElement.setAttribute(REFERENCE_ATTR.order, this.__order.toString());
		// addClassNamesToElement(spanElement, "inline");
		const supElement = document.createElement("sup");
		supElement.setAttribute(REFERENCE_ATTR.container, "");
		supElement.setAttribute(REFERENCE_ATTR.referenceId, this.__reference_id);
		supElement.setAttribute(REFERENCE_ATTR.order, this.__order.toString());
		supElement.innerHTML = this.__order.toString();
		// addClassNamesToElement(supElement, "cursor-pointer pl-[2px]");
		addClassNamesToElement(supElement, REFERENCE_CLASS.sup);
		spanElement.appendChild(supElement);
		return {
			element: spanElement,
		};
	}

	static importJSON(
		serializedNode: SerializedFootnoteReferenceNode,
	): FootnoteReferenceNode {
		return $createFootnoteReferenceNode().updateFromJSON(serializedNode);
	}
	updateFromJSON(serializedNode: SerializedFootnoteReferenceNode): this {
		return super
			.updateFromJSON(serializedNode)
			.setReferenceId(serializedNode.reference_id)
			.setOrder(serializedNode.order);
	}

	exportJSON(): SerializedFootnoteReferenceNode {
		if (!this.__reference_id) {
			throw new Error("Reference ID is required");
		}
		if (!this.__order) {
			throw new Error("Order is required");
		}
		return {
			...super.exportJSON(),
			reference_id: this.__reference_id,
			order: this.__order,
		};
	}
}

let ReferenceNodeClass: typeof FootnoteReferenceNode = FootnoteReferenceNode;
export const registerReferenceNodeClass = (klass: typeof FootnoteReferenceNode) => {
	ReferenceNodeClass = klass;
}
export const $createFootnoteReferenceNode = (
	referenceId?: string | null,
	order?: number | null,
	key?: NodeKey,
): FootnoteReferenceNode => {
	const node = new ReferenceNodeClass(referenceId, order, key);
	// const node = new FootnoteReferenceNode(referenceId, order, key);
	if (referenceId) {
		node.setReferenceId(referenceId);
	}
	if (typeof order === "number") {
		node.setOrder(order);
	}
	return node;
};

export const $isFootnoteReferenceNode = (
	node: LexicalNode | null,
): node is FootnoteReferenceNode => {
	return node instanceof FootnoteReferenceNode;
};

