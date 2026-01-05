import {
	DecoratorNode,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	type LexicalEditor,
	type LexicalNode,
	type LexicalUpdateJSON,
	type NodeKey,
	type SerializedLexicalNode,
	type Spread,
} from "lexical";
import { LINE_BREAK_ATTR, LINE_BREAK_CLASS, LINE_BREAK_TYPE } from "../shared/constants/line-break.js";

export type FootnoteLineBreakNodeProps = {};

export type SerializedFootnoteLineBreakNode = Spread<
	FootnoteLineBreakNodeProps,
	SerializedLexicalNode
>;

export const convertFootnoteLineBreakNode = (
	_domNode: HTMLDivElement,
): DOMConversionOutput | null => {
	const node = $createFootnoteLineBreakNode();
	return {
		node,
	};
};

export class FootnoteLineBreakNode extends DecoratorNode<unknown> {
	constructor(key?: NodeKey) {
		super(key);
	}

	static getType(): string {
		return LINE_BREAK_TYPE;
	}

	static clone(node: FootnoteLineBreakNode): FootnoteLineBreakNode {
		return new FootnoteLineBreakNode(node.__key);
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

	static importDOM(): DOMConversionMap<HTMLDivElement> | null {
		return {
			div: (domNode: HTMLDivElement) => {
				if (!domNode.hasAttribute(LINE_BREAK_ATTR.container)) return null;
				return {
					conversion: convertFootnoteLineBreakNode,
					priority: 2,
				};
			},
		};
	}

	static importJSON(
		json: SerializedFootnoteLineBreakNode,
	): FootnoteLineBreakNode {
		return $createFootnoteLineBreakNode().updateFromJSON(json);
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
}

let LineBreakNodeClass: typeof FootnoteLineBreakNode = FootnoteLineBreakNode;

export const registerLineBreakNodeClass = (klass: typeof FootnoteLineBreakNode) => {
	LineBreakNodeClass = klass;
}
export const $createFootnoteLineBreakNode = (): FootnoteLineBreakNode => {
	// return new FootnoteLineBreakNode();
	return new LineBreakNodeClass();
};

export const $isFootnoteLineBreakNode = (
	node: LexicalNode | null,
): node is FootnoteLineBreakNode => {
	return node instanceof FootnoteLineBreakNode;
};

