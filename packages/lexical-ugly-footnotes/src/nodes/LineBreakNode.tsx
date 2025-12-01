// import LineBreak from "@/app/_components/Editor/plugins/LineBreakPlugin/components/LineBreak";

import { addClassNamesToElement } from "@lexical/utils";
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
import type React from "react";
import LineBreak from "../components/LineBreakComponent.js";

export type FootnoteLineBreakNodeProps = {};

type SerializedFootnoteLineBreakNode = Spread<
	FootnoteLineBreakNodeProps,
	SerializedLexicalNode
>;

export const PLUGIN_TYPE_LINE_BREAK = "footnote-linebreak";

const ATTR = {
	container: `data-editor-${PLUGIN_TYPE_LINE_BREAK}-container`,
};

const CLASS_NAME = {
	container: `editor-${PLUGIN_TYPE_LINE_BREAK}-container`,
};

const makeFootnoteLineBreakDom = (): HTMLSpanElement => {
	const container = document.createElement("span");
	addClassNamesToElement(container, "inline-block w-full h-px bg-foreground");

	return container;
};

export const convertFootnoteLineBreakNode = (
	_domNode: HTMLDivElement,
): DOMConversionOutput | null => {
	const node = $createFootnoteLineBreakNode();
	return {
		node,
	};
};

export class FootnoteLineBreakNode extends DecoratorNode<React.ReactNode> {
	constructor(key?: NodeKey) {
		super(key);
	}

	static getType(): string {
		return PLUGIN_TYPE_LINE_BREAK;
	}

	static clone(node: FootnoteLineBreakNode): FootnoteLineBreakNode {
		return new FootnoteLineBreakNode(node.__key);
	}

	createDOM(): HTMLElement {
		const div = document.createElement("div");
		div.setAttribute(ATTR.container, "");
		div.classList.add(CLASS_NAME.container);
		return div;
	}

	updateDOM(): boolean {
		return false;
	}

	static importDOM(): DOMConversionMap<HTMLDivElement> | null {
		return {
			div: (domNode: HTMLDivElement) => {
				if (!domNode.hasAttribute(ATTR.container)) return null;
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
		element.setAttribute(ATTR.container, "");
		element.classList.add(CLASS_NAME.container);
		element.setAttribute("data-lexical-decorator", "true");
		const container = makeFootnoteLineBreakDom();
		element.appendChild(container);
		return {
			element,
		};
	}

	override exportJSON(): SerializedFootnoteLineBreakNode {
		return {
			...super.exportJSON(),
		};
	}

	decorate(): React.ReactNode {
		return (
			<>
				<LineBreak nodeKey={this.getKey()} />
			</>
		);
	}
}

export const $createFootnoteLineBreakNode = (): FootnoteLineBreakNode => {
	return new FootnoteLineBreakNode();
};

export const $isFootnoteLineBreakNode = (
	node: LexicalNode | null,
): node is FootnoteLineBreakNode => {
	return node instanceof FootnoteLineBreakNode;
};
