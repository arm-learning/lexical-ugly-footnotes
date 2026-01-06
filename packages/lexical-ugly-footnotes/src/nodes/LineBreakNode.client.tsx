import type { DOMConversionMap, EditorConfig, LexicalEditor, NodeKey } from "lexical";
import type React from "react";
import type { ComponentType } from "react";
import LineBreak from "../components/LineBreakComponent.js";
import { LINE_BREAK_ATTR } from "../shared/constants/line-break.js";
import {
	FootnoteLineBreakBase,
	createConvertFootnoteLineBreakNode,
	type SerializedFootnoteLineBreakNode,
} from "../shared/nodes/LineBreak.base.js";
import { getLineBreakClasses } from "../theme/index.js";
import type { LineBreakComponentProps } from "../types/line-break.js";

// Re-export types from base
export type { FootnoteLineBreakNodeProps, SerializedFootnoteLineBreakNode } from "../shared/nodes/LineBreak.base.js";

// ============================================================================
// Client Node Class
// ============================================================================

export class FootnoteLineBreakNode extends FootnoteLineBreakBase<React.ReactNode> {
	constructor(key?: NodeKey) {
		super(key);
	}

	static clone(node: FootnoteLineBreakNode): FootnoteLineBreakNode {
		return new FootnoteLineBreakNode(node.__key);
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

	component(): ComponentType<LineBreakComponentProps> | null {
		return LineBreak;
	}

	decorate(editor: LexicalEditor, config: EditorConfig): React.ReactNode {
		const Component = this.component();
		if (!Component) return null;
		const classes = getLineBreakClasses(config);
		return <Component nodeKey={this.getKey()} classNames={classes} />;
	}
}

// ============================================================================
// Client-specific helpers
// ============================================================================

export const convertFootnoteLineBreakNode = createConvertFootnoteLineBreakNode(
	() => $createFootnoteLineBreakNode(),
);

let LineBreakNodeClass: typeof FootnoteLineBreakNode = FootnoteLineBreakNode;

export const registerLineBreakNodeClass = (klass: typeof FootnoteLineBreakNode) => {
	LineBreakNodeClass = klass;
};

export const $createFootnoteLineBreakNode = (): FootnoteLineBreakNode => {
	return new LineBreakNodeClass();
};

// Re-export $isFootnoteLineBreakNode from base
export { $isFootnoteLineBreakNode } from "../shared/nodes/LineBreak.base.js";
