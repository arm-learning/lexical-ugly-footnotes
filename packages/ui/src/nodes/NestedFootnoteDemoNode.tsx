import type {
	DOMConversionMap,
	EditorConfig,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	SerializedEditor,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { DecoratorNode } from "lexical";
import { createEditor } from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { ParagraphNode, TextNode } from "lexical";
import type { ComponentType } from "react";
import {
	FootnoteBlockNode,
	FootnoteLineBreakNode,
	FootnoteReferenceNode,
} from "lexical-ugly-footnotes/client";
import NestedFootnoteDemoComponent from "../components/NestedFootnoteDemoComponent.js";

export type SerializedNestedFootnoteDemoNode = Spread<
	{
		nestedEditorState: SerializedEditor;
	},
	SerializedLexicalNode
>;

const NESTED_DEMO_NODE_TYPE = "nested-footnote-demo";

// Create a nested editor for the demo node
const createNestedDemoEditor = () => {
	return createEditor({
		nodes: [
			TextNode,
			ParagraphNode,
			LinkNode,
			HeadingNode,
			FootnoteBlockNode,
			FootnoteReferenceNode,
			FootnoteLineBreakNode,
		],
		namespace: "nested-footnote-demo-editor",
		theme: {},
	});
};

export class NestedFootnoteDemoNode extends DecoratorNode<React.ReactNode> {
	__nestedEditor: LexicalEditor;
	__initialContent: string | null;

	constructor(nestedEditor?: LexicalEditor, initialContent?: string | null, key?: NodeKey) {
		super(key);
		this.__nestedEditor = nestedEditor ?? createNestedDemoEditor();
		this.__initialContent = initialContent ?? null;
	}

	static getType(): string {
		return NESTED_DEMO_NODE_TYPE;
	}

	static clone(node: NestedFootnoteDemoNode): NestedFootnoteDemoNode {
		return new NestedFootnoteDemoNode(
			node.__nestedEditor,
			node.__initialContent,
			node.__key,
		);
	}

	getNestedEditor(): LexicalEditor {
		const self = this.getLatest();
		return self.__nestedEditor;
	}

	getInitialContent(): string | null {
		const self = this.getLatest();
		return self.__initialContent;
	}

	setInitialContent(content: string | null): this {
		const self = this.getWritable();
		self.__initialContent = content;
		return self;
	}

	createDOM(): HTMLElement {
		const div = document.createElement("div");
		div.setAttribute("data-nested-footnote-demo", "true");
		div.classList.add("nested-footnote-demo-container");
		return div;
	}

	updateDOM(): boolean {
		return false;
	}

	static importDOM(): DOMConversionMap | null {
		return {
			div: (domNode: Node) => {
				if (
					domNode instanceof HTMLDivElement &&
					domNode.hasAttribute("data-nested-footnote-demo")
				) {
					return {
						conversion: () => {
							const nestedEditor = createNestedDemoEditor();
							// Parse content from DOM if needed
							return { node: new NestedFootnoteDemoNode(nestedEditor) };
						},
						priority: 1,
					};
				}
				return null;
			},
		};
	}

	static importJSON(
		serializedNode: SerializedNestedFootnoteDemoNode,
	): NestedFootnoteDemoNode {
		const nestedEditor = createNestedDemoEditor();
		const node = new NestedFootnoteDemoNode(nestedEditor);
		
		if (serializedNode.nestedEditorState) {
			const editorState = nestedEditor.parseEditorState(serializedNode.nestedEditorState.editorState);
			if (!editorState.isEmpty()) {
				nestedEditor.setEditorState(editorState);
			}
		}
		
		return node;
	}

	exportJSON(): SerializedNestedFootnoteDemoNode {
		const nestedEditorState = this.__nestedEditor.getEditorState().toJSON();
		return {
			...super.exportJSON(),
			type: NESTED_DEMO_NODE_TYPE,
			// nestedEditorState,
            nestedEditorState: {
                editorState: nestedEditorState,
            },
		};
	}

	component(): ComponentType<{
		nodeKey: NodeKey;
		nestedEditor: LexicalEditor;
		initialContent: string | null;
	}> | null {
		return NestedFootnoteDemoComponent;
	}

	decorate(editor: LexicalEditor, config: EditorConfig): React.ReactNode {
		const Component = this.component();
		if (!Component) return null;
		return (
			<Component
				nodeKey={this.getKey()}
				nestedEditor={this.__nestedEditor}
				initialContent={this.__initialContent}
			/>
		);
	}
}

export function $createNestedFootnoteDemoNode(
	nestedEditor?: LexicalEditor,
	initialContent?: string | null,
): NestedFootnoteDemoNode {
	return new NestedFootnoteDemoNode(nestedEditor, initialContent);
}

export function $isNestedFootnoteDemoNode(
	node: LexicalNode | null,
): node is NestedFootnoteDemoNode {
	return node instanceof NestedFootnoteDemoNode;
}

