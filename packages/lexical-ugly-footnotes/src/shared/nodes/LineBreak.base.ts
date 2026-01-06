import {
	DecoratorNode,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	type LexicalNode,
	type LexicalUpdateJSON,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread,
} from "lexical";
import { LINE_BREAK_ATTR, LINE_BREAK_CLASS, LINE_BREAK_TYPE } from "../constants/line-break.js";

// ============================================================================
// Types
// ============================================================================

export type FootnoteLineBreakNodeProps = {};

export type SerializedFootnoteLineBreakNode = Spread<
	FootnoteLineBreakNodeProps,
	SerializedLexicalNode
>;

// ============================================================================
// DOM Conversion (used by importDOM)
// ============================================================================

/**
 * Converts a DOM node to a FootnoteLineBreakNode.
 * This is passed as a factory function parameter to allow each environment
 * to provide its own $create function.
 */
export const createConvertFootnoteLineBreakNode = (
	$createFn: () => FootnoteLineBreakBase<unknown>,
) => {
	return (_domNode: HTMLDivElement): DOMConversionOutput | null => {
		const node = $createFn();
		return { node };
	};
};

// ============================================================================
// Abstract Base Class
// ============================================================================

/**
 * Abstract base class for FootnoteLineBreakNode.
 * Server extends with <null>, Client extends with <React.ReactNode>
 */
export abstract class FootnoteLineBreakBase<T> extends DecoratorNode<T> {
	constructor(key?: NodeKey) {
		super(key);
	}

	static getType(): string {
		return LINE_BREAK_TYPE;
	}

	static clone(node: FootnoteLineBreakBase<unknown>): FootnoteLineBreakBase<unknown> {
		throw new Error("clone() must be implemented by subclass");
	}

	createDOM(): HTMLElement {
		const div = document.createElement("div");
		div.setAttribute(LINE_BREAK_ATTR.container, "");
		div.classList.add(LINE_BREAK_CLASS.container);
		return div;
	}

	updateDOM(): boolean {
		return false;
	}

	/**
	 * Static importDOM must be implemented by subclass because it needs
	 * to call the environment-specific $createFootnoteLineBreakNode
	 */
	static importDOM(): DOMConversionMap<HTMLDivElement> | null {
		throw new Error("importDOM() must be implemented by subclass");
	}

	/**
	 * Static importJSON must be implemented by subclass because it needs
	 * to call the environment-specific $createFootnoteLineBreakNode
	 */
	static importJSON(
		json: SerializedFootnoteLineBreakNode,
	): FootnoteLineBreakBase<unknown> {
		throw new Error("importJSON() must be implemented by subclass");
	}

	updateFromJSON(
		serializedNode: LexicalUpdateJSON<SerializedFootnoteLineBreakNode>,
	): this {
		return super.updateFromJSON(serializedNode);
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("div");
		element.setAttribute(LINE_BREAK_ATTR.container, "");
		element.classList.add(LINE_BREAK_CLASS.container);
		element.setAttribute("data-lexical-decorator", "true");

		const lineBreak = document.createElement("div");
		lineBreak.classList.add(LINE_BREAK_CLASS.base);
		element.appendChild(lineBreak);

		return { element };
	}

	override exportJSON(): SerializedFootnoteLineBreakNode {
		return {
			...super.exportJSON(),
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

export const $isFootnoteLineBreakNode = (
	node: LexicalNode | null,
): node is FootnoteLineBreakBase<unknown> => {
	return node instanceof FootnoteLineBreakBase;
};
