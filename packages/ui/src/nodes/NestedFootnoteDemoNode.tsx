import type {
	DOMConversionMap,
	DOMExportOutput,
	EditorConfig,
	LexicalEditor,
	LexicalNode,
	NodeKey,
	SerializedEditor,
	SerializedLexicalNode,
	Spread,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";
import { $getRoot, $insertNodes, DecoratorNode } from "lexical";
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
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";

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
			FootnoteReferenceNode,
		],
		namespace: "nested-footnote-demo-editor",
		theme: {},
	});
};

const convertElementToNestedEditor = (domNode: Node) => {
	if (domNode instanceof HTMLDivElement && domNode.hasAttribute(`data-${NESTED_DEMO_NODE_TYPE}`)) {
		const nestedEditor = createNestedDemoEditor();
		
		nestedEditor.update(() => {
			// The exportDOM creates a structure with an outer wrapper and an inner paragraphContainer
			// Find the paragraphContainer (first child div) which contains the actual editor content
			const paragraphContainer = domNode.firstElementChild as HTMLElement | null;
			
			// If we have a paragraphContainer, use its innerHTML (the actual editor content)
			// Otherwise, use the domNode's innerHTML directly
			const contentHTML = paragraphContainer?.innerHTML || domNode.innerHTML;
			
			// Create a temporary container div with the content
			const tempDiv = document.createElement('div');
			tempDiv.innerHTML = contentHTML;
			
			// Generate nodes from the content element
			const nodes = $generateNodesFromDOM(nestedEditor, tempDiv);
			const root = $getRoot();
			root.clear();
			for (const node of nodes) {
				root.append(node);
			}
		});
		
		return new NestedFootnoteDemoNode(nestedEditor);
	}
	return null;
}
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

	// static importDOM(): DOMConversionMap | null {
	// 	return {
	// 		div: (domNode: Node) => {
	// 			if (
	// 				domNode instanceof HTMLDivElement &&
	// 				domNode.hasAttribute("data-nested-footnote-demo")
	// 			) {
	// 				return {
	// 					conversion: () => {
	// 						const nestedEditor = createNestedDemoEditor();
	// 						// Parse content from DOM if needed
	// 						return { node: new NestedFootnoteDemoNode(nestedEditor) };
	// 					},
	// 					priority: 1,
	// 				};
	// 			}
	// 			return null;
	// 		},
	// 	};
	// }

	static importJSON(
		serializedNode: SerializedNestedFootnoteDemoNode,
	): NestedFootnoteDemoNode {
		const nestedEditor = createNestedDemoEditor();
		const node = new NestedFootnoteDemoNode(nestedEditor);
		
		if (serializedNode.nestedEditorState) {
			// SerializedEditor has structure { editorState: SerializedEditorState }
			const editorState = nestedEditor.parseEditorState(serializedNode.nestedEditorState.editorState);
			if (!editorState.isEmpty()) {
				nestedEditor.setEditorState(editorState);
			}
		}
		
		return node;
	}

	exportJSON(): SerializedNestedFootnoteDemoNode {
		// Use toJSON() on the editor to get SerializedEditor (which is { editorState: SerializedEditorState })
		const nestedEditorState = this.__nestedEditor.toJSON();
		return {
			...super.exportJSON(),
			type: NESTED_DEMO_NODE_TYPE,
			nestedEditorState,
		};
	}

	static importDOM(): DOMConversionMap | null {
		return {
			div: (domNode: Node) => {
				if (domNode instanceof HTMLDivElement && domNode.hasAttribute(`data-${NESTED_DEMO_NODE_TYPE}`)) {
					return { conversion: () => { return { node: convertElementToNestedEditor(domNode) }; }, priority: 1 };
				}
				return null;
			},
		};
	}
	exportDOM(): DOMExportOutput {
		const divRootContainer = document.createElement("div");
		divRootContainer.setAttribute(`data-${NESTED_DEMO_NODE_TYPE}`, "true");
		addClassNamesToElement(divRootContainer, "border-2 border-dashed border-blue-400 rounded-lg p-4 my-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 shadow-sm");
		const paragraphContainer = document.createElement("div");
		// relative border-2 border-blue-200 rounded-md p-4 min-h-[150px] bg-white shadow-inner
		addClassNamesToElement(paragraphContainer, "relative border-2 border-blue-200 rounded-md p-4 min-h-[150px] bg-white shadow-inner");
		const nestedEditor = this.__nestedEditor;
		nestedEditor.read(() => {
			const html = $generateHtmlFromNodes(nestedEditor, null);
			paragraphContainer.innerHTML = html;
		})
		divRootContainer.appendChild(paragraphContainer);
		return {
			element: divRootContainer,
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

