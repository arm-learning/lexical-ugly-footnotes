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
import { footnoteService } from "../service.js";
import { REFERENCE_ATTR, REFERENCE_CLASS, REFERENCE_TYPE } from "../constants/reference.js";

// ============================================================================
// Types
// ============================================================================

export type SerializedFootnoteReferenceNode = Spread<
	{
		reference_id: string;
		order: number;
	},
	SerializedLexicalNode
>;

// ============================================================================
// DOM Conversion (used by importDOM)
// ============================================================================

/**
 * Creates a conversion function for DOM import.
 * Passed as a factory to allow each environment to provide its own $create function.
 */
export const createConvertFootnoteReferenceElement = (
	$createFn: () => FootnoteReferenceBase<unknown>,
) => {
	return (domNode: Node): DOMConversionOutput | null => {
		if (
			domNode instanceof HTMLSpanElement &&
			domNode.hasAttribute(REFERENCE_ATTR.container)
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
				node: $createFn()
					.setReferenceId(referenceId)
					.setOrder(Number.parseInt(order)),
			};
		}
		return null;
	};
};

// ============================================================================
// Abstract Base Class
// ============================================================================

/**
 * Abstract base class for FootnoteReferenceNode.
 * Server extends with <unknown>, Client extends with <React.ReactNode>
 */
export abstract class FootnoteReferenceBase<T> extends DecoratorNode<T> {
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

	static clone(node: FootnoteReferenceBase<unknown>): FootnoteReferenceBase<unknown> {
		throw new Error("clone() must be implemented by subclass");
	}

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
		prevNode: FootnoteReferenceBase<unknown>,
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

	/**
	 * Static importDOM must be implemented by subclass because it needs
	 * to call the environment-specific $createFootnoteReferenceNode
	 */
	static importDOM(): DOMConversionMap | null {
		throw new Error("importDOM() must be implemented by subclass");
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
		const supElement = document.createElement("sup");
		supElement.setAttribute(REFERENCE_ATTR.container, "");
		supElement.setAttribute(REFERENCE_ATTR.referenceId, this.__reference_id);
		supElement.setAttribute(REFERENCE_ATTR.order, this.__order.toString());
		supElement.innerHTML = this.__order.toString();
		addClassNamesToElement(supElement, REFERENCE_CLASS.sup);
		spanElement.appendChild(supElement);
		return {
			element: spanElement,
		};
	}

	/**
	 * Static importJSON must be implemented by subclass because it needs
	 * to call the environment-specific $createFootnoteReferenceNode
	 */
	static importJSON(
		serializedNode: SerializedFootnoteReferenceNode,
	): FootnoteReferenceBase<unknown> {
		throw new Error("importJSON() must be implemented by subclass");
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

	/**
	 * decorate() must be implemented by subclass.
	 * Server returns null, Client returns React.ReactNode
	 */
	abstract decorate(...args: unknown[]): T;
}

// ============================================================================
// Type Guard
// ============================================================================

export const $isFootnoteReferenceNode = (
	node: LexicalNode | null,
): node is FootnoteReferenceBase<unknown> => {
	return node instanceof FootnoteReferenceBase;
};
