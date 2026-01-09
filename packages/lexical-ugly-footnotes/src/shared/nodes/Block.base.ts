import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { LinkNode } from "@lexical/link";
import { HeadingNode } from "@lexical/rich-text";
import { addClassNamesToElement } from "@lexical/utils";
import {
	$getRoot,
	$insertNodes,
	createEditor,
	DecoratorNode,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	type EditorConfig,
	type EditorThemeClasses,
	type LexicalEditor,
	type LexicalNode,
	type NodeKey,
	ParagraphNode,
	type SerializedEditor,
	type SerializedLexicalNode,
	type Spread,
	TextNode,
} from "lexical";
import { footnoteService } from "../service.js";
import {
	BLOCK_ATTR,
	BLOCK_ATTR_NESTED_EDITOR,
	BLOCK_TYPE,
} from "../constants/block.js";

// ============================================================================
// Theme for nested editor
// ============================================================================

export const theme: EditorThemeClasses = {
	root: "font-ebgaramond",
	layoutContainer: "grid gap-2 my-2",
	layoutItem: "border border-dashed border-gray-500 py-2 px-4",
	paragraph: "text-base text-foreground",
	text: {
		bold: "font-bold text-foreground",
		italic: "italic text-foreground",
		underline: "underline text-foreground",
		strikethrough: "line-through text-foreground",
		underlineStrikethrough: "underline line-through text-foreground",
	},
};

// ============================================================================
// Types
// ============================================================================

export type SerializedBlockNote = SerializedEditor;

export type SerializedFootnoteBlockNode = Spread<
	{
		blockNote: SerializedBlockNote;
		referenceId: string;
		order: number;
	},
	SerializedLexicalNode
>;

// ============================================================================
// Helper Functions
// ============================================================================

export const innerHtmlToEditorState = (
	nestedEditor: LexicalEditor,
	innerHtml: string,
) => {
	const parser = new DOMParser();
	const document = parser.parseFromString(innerHtml, "text/html");
	const serializedEditorState = (() => {
		nestedEditor.update(() => {
			const nodes = $generateNodesFromDOM(nestedEditor, document);
			const root = $getRoot();
			root.clear();
			return $insertNodes(nodes);
		});
		const editorState = nestedEditor.getEditorState();
		const json = editorState.toJSON();
		return json;
	})();
	return serializedEditorState;
};

export const createNestedEditor = () => {
	return createEditor({
		nodes: [TextNode, ParagraphNode, LinkNode, HeadingNode],
		namespace: BLOCK_ATTR_NESTED_EDITOR.namespace,
		theme: theme,
	});
};

// ============================================================================
// DOM Conversion (used by importDOM)
// ============================================================================

/**
 * Creates a conversion function for DOM import.
 * Passed as a factory to allow each environment to provide its own $create function.
 */
export const createConvertFootnoteBlockElement = (
	$createFn: (referenceId?: string, order?: number, blockNote?: LexicalEditor) => FootnoteBlockBase<unknown>,
) => {
	return (domNode: Node): DOMConversionOutput | null => {
		if (
			domNode instanceof HTMLDivElement &&
			domNode.hasAttribute(BLOCK_ATTR.container)
		) {
			const nestedEditorDiv = Array.from(domNode.children).find(
				(child) =>
					child instanceof HTMLDivElement &&
					child.hasAttribute(BLOCK_ATTR_NESTED_EDITOR.container),
			);
			if (!nestedEditorDiv) {
				throw new Error("Nested editor div not found");
			}
			const nestedEditor = createNestedEditor();
			const serializedEditorState = innerHtmlToEditorState(
				nestedEditor,
				nestedEditorDiv.innerHTML,
			);
			const isEditorStateValid = nestedEditor.parseEditorState(
				serializedEditorState,
			);
			if (!isEditorStateValid.isEmpty()) {
				nestedEditor.setEditorState(isEditorStateValid);
			}

			const referenceId = domNode.getAttribute(BLOCK_ATTR.reference_id);
			if (!referenceId) {
				throw new Error("Node ID is required");
			}
			const order = domNode.getAttribute(BLOCK_ATTR.order);
			if (!order) {
				throw new Error("Order is required");
			}
			const orderNumber = Number.parseInt(order);
			if (Number.isNaN(orderNumber)) {
				throw new Error("Order is not a number");
			}
			// if (!footnoteService.hasBlock(referenceId)) {
			// 	footnoteService.upsertBlock(referenceId, orderNumber);
			// }
			footnoteService.upsertBlock(referenceId, orderNumber);
			return {
				node: $createFn(referenceId, orderNumber, nestedEditor),
			};
		}
		return null;
	};
};

// ============================================================================
// Abstract Base Class
// ============================================================================

/**
 * Abstract base class for FootnoteBlockNode.
 * Server extends with <unknown>, Client extends with <React.ReactNode>
 */
export abstract class FootnoteBlockBase<T> extends DecoratorNode<T> {
	__referenceId?: string;
	__order: number;
	__blockNote: LexicalEditor;

	constructor(referenceId?: string, blockNote?: LexicalEditor, key?: NodeKey) {
		super(key);
		this.__referenceId = referenceId;
		this.__order = 1;
		this.__blockNote = blockNote ?? createNestedEditor();
	}

	static getType(): string {
		return BLOCK_TYPE;
	}

	static clone(node: FootnoteBlockBase<unknown>): FootnoteBlockBase<unknown> {
		throw new Error("clone() must be implemented by subclass");
	}

	getBlockNote(): LexicalEditor {
		const self = this.getLatest();
		return self.__blockNote;
	}

	setBlockNote(serializedBlockNote: SerializedBlockNote): this {
		const self = this.getWritable();
		const nestedEditor = createNestedEditor();

		const editorState = nestedEditor.parseEditorState(
			serializedBlockNote.editorState,
		);
		if (!editorState.isEmpty()) {
			nestedEditor.setEditorState(editorState);
		}

		self.__blockNote = nestedEditor;
		return self;
	}

	setBlockNoteFromEditor(editor: LexicalEditor): this {
		const self = this.getWritable();
		self.__blockNote = editor;
		return self;
	}

	getKey(): NodeKey {
		const self = this.getLatest();
		return self.__key;
	}

	getReferenceId(): string | null {
		const self = this.getLatest();
		return self.__referenceId ?? null;
	}

	setReferenceId(referenceId: string): this {
		const self = this.getWritable();
		self.__referenceId = referenceId;
		return self;
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

	getNestedEditorTextContent() {
		const self = this.getLatest();
		return self.__blockNote.read(() => {
			return $generateHtmlFromNodes(self.__blockNote, null);
		});
	}

	createDOM(): HTMLElement {
		const div = document.createElement("div");
		addClassNamesToElement(div, "luf-block");
		div.setAttribute(BLOCK_ATTR.container, "");
		if (this.__referenceId) {
			div.setAttribute(BLOCK_ATTR.reference_id, this.__referenceId);
		}
		if (this.__order) {
			div.setAttribute(BLOCK_ATTR.order, this.__order.toString());
		}
		return div;
	}

	updateDOM(
		prevNode: FootnoteBlockBase<unknown>,
		dom: HTMLElement,
		config: EditorConfig,
	): boolean {
		if (prevNode.__order !== this.__order) {
			dom.setAttribute(BLOCK_ATTR.order, this.__order.toString());
			return true;
		}
		if (prevNode.__referenceId !== this.__referenceId) {
			dom.setAttribute(BLOCK_ATTR.reference_id, this.__referenceId ?? "");
			return true;
		}
		return false;
	}

	/**
	 * Static importDOM must be implemented by subclass because it needs
	 * to call the environment-specific $createFootnoteBlockNode
	 */
	static importDOM(): DOMConversionMap | null {
		throw new Error("importDOM() must be implemented by subclass");
	}

	exportDOM(): DOMExportOutput {
		if (!this.__referenceId) {
			console.error("[FootnoteBlockNode.exportDOM] Missing referenceId:", {
				nodeKey: this.getKey(),
				referenceId: this.__referenceId,
				order: this.__order,
			});
			throw new Error("Node ID is required");
		}
		if (!this.__order) {
			console.error("[FootnoteBlockNode.exportDOM] Missing order:", {
				nodeKey: this.getKey(),
				referenceId: this.__referenceId,
				order: this.__order,
			});
			throw new Error("Order is required");
		}
		const divRootContainer = document.createElement("div");
		divRootContainer.setAttribute(BLOCK_ATTR.reference_id, this.__referenceId);
		divRootContainer.setAttribute(BLOCK_ATTR.order, this.__order.toString());
		divRootContainer.setAttribute(BLOCK_ATTR.container, "");
		divRootContainer.setAttribute("data-lexical-decorator", "true");
		const TODOVariable = BLOCK_ATTR.container === "data-luf-block-container";
		if (!TODOVariable) {
			throw new Error("Container attribute has changed, update class name");
		}
		addClassNamesToElement(divRootContainer, "luf-block");

		const sup = document.createElement("sup");
		sup.setAttribute(BLOCK_ATTR.reference_id, this.__referenceId);
		sup.setAttribute(BLOCK_ATTR.order, this.__order.toString());
		sup.textContent = this.__order.toString();
		addClassNamesToElement(sup, "luf-block-order");
		divRootContainer.appendChild(sup);
		const divNestedEditor = document.createElement("div");
		divNestedEditor.setAttribute(BLOCK_ATTR_NESTED_EDITOR.container, "");
		addClassNamesToElement(divNestedEditor, "luf-block-editor-static");
		divRootContainer.appendChild(divNestedEditor);
		const nestedEditor = this.__blockNote;
		nestedEditor.read(() => {
			const html = $generateHtmlFromNodes(this.__blockNote, null);
			divNestedEditor.innerHTML = html;
		});
		return {
			element: divRootContainer,
		};
	}

	/**
	 * Static importJSON must be implemented by subclass because it needs
	 * to call the environment-specific $createFootnoteBlockNode
	 */
	static importJSON(
		serializedNode: SerializedFootnoteBlockNode,
	): FootnoteBlockBase<unknown> {
		throw new Error("importJSON() must be implemented by subclass");
	}

	updateFromJSON(serializedNode: SerializedFootnoteBlockNode): this {
		return super
			.updateFromJSON(serializedNode)
			.setReferenceId(serializedNode.referenceId)
			.setBlockNote(serializedNode.blockNote);
	}

	exportJSON(): SerializedFootnoteBlockNode {
		if (!this.__referenceId) {
			throw new Error("Reference ID is required");
		}
		const order = this.getOrder();
		if (!order) {
			throw new Error("Order is required");
		}
		return {
			...super.exportJSON(),
			blockNote: this.__blockNote.toJSON(),
			referenceId: this.__referenceId,
			order: order,
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

export const $isFootnoteBlockNode = (
	node: LexicalNode | null,
): node is FootnoteBlockBase<unknown> => {
	return node instanceof FootnoteBlockBase;
};
