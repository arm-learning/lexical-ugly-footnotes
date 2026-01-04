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
import { footnoteService } from "../core/index.js";
import FootnoteBlockComponent from "../components/BlockComponent.js";
import {
  BLOCK_ATTR,
  BLOCK_ATTR_NESTED_EDITOR,
  BLOCK_TYPE,
} from "../constants/block.js";
import type { ComponentType } from "react";
import type { BlockComponentProps } from "../types/block.js";

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

const innerHtmlToEditorState = (
  nestedEditor: LexicalEditor,
  innerHtml: string,
) => {
  const parser = new DOMParser();
  const document = parser.parseFromString(innerHtml, "text/html");
  // console.log({ document });
  // console.log("Parsed DOM:", document.body.innerHTML);
  const serializedEditorState = (() => {
    nestedEditor.update(() => {
      const nodes = $generateNodesFromDOM(nestedEditor, document);

      // console.log("Generated Nodes:", nodes);
      const root = $getRoot();
      root.clear();
      return $insertNodes(nodes);
    });
    const editorState = nestedEditor.getEditorState();
    const json = editorState.toJSON();
    // console.log("Serialized Editor State:", json);
    // console.log({json})
    return json;
  })();
  return serializedEditorState;
};
const convertFootnoteBlockElement = (
  domNode: Node,
): DOMConversionOutput | null => {
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
    const nestedEditor = createEditor({
      namespace: BLOCK_ATTR_NESTED_EDITOR.namespace,
      nodes: [TextNode, ParagraphNode, LinkNode, HeadingNode],
      theme: theme,
    });
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
    if (!footnoteService.hasBlock(referenceId)) {
      footnoteService.upsertBlock(referenceId, orderNumber);
    }
    // console.log({ layout });
    return {
      node: $createFootnoteBlockNode(referenceId, orderNumber, nestedEditor),
    };
  }
  return null;
};

export type SerializedBlockNote = SerializedEditor;

export type SerializedFootnoteBlockNode = Spread<
  {
    blockNote: SerializedBlockNote;
    referenceId: string;
    order: number;
  },
  SerializedLexicalNode
>;

export class FootnoteBlockNode extends DecoratorNode<React.ReactNode> {
  __referenceId?: string;
  __order: number;
  __blockNote: LexicalEditor;
  constructor(referenceId?: string, blockNote?: LexicalEditor, key?: NodeKey) {
    super(key);
    this.__referenceId = referenceId;
    this.__order = 1;
    this.__blockNote =
      blockNote ??
      createEditor({
        nodes: [TextNode, ParagraphNode, LinkNode, HeadingNode],
        namespace: BLOCK_ATTR_NESTED_EDITOR.namespace,
        theme: theme,
      });
  }

  static getType(): string {
    return BLOCK_TYPE;
  }

  getBlockNote(): LexicalEditor {
    const self = this.getLatest();
    return self.__blockNote;
  }

  // setFrame(frame: Frame): this {
  // 	const self = this.getWritable();
  // 	self.__frame = frame;
  // 	return self;
  // }
  setBlockNote(serializedBlockNote: SerializedBlockNote): this {
    const self = this.getWritable();
    const nestedEditor = createEditor({
      nodes: [TextNode, ParagraphNode, LinkNode, HeadingNode],
      theme: theme,
      namespace: BLOCK_ATTR_NESTED_EDITOR.namespace,
    });

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

  static clone(node: FootnoteBlockNode): FootnoteBlockNode {
    return new FootnoteBlockNode(
      node.__referenceId,
      node.__blockNote,
      node.__key,
    );
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    addClassNamesToElement(
      div,
      // "grid grid-cols-[auto_1fr_auto] gap-2 pt-2",
      "luf-block",
    );
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
    prevNode: FootnoteBlockNode,
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

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: Node) => {
        if (
          domNode instanceof HTMLDivElement &&
          domNode.hasAttribute(BLOCK_ATTR.container)
        ) {
          return {
            conversion: convertFootnoteBlockElement,
            priority: 1,
          };
        }
        return null;
      },
    };
  }

  exportDOM(): DOMExportOutput {
    if (!this.__referenceId) {
      throw new Error("Node ID is required");
    }
    if (!this.__order) {
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
    addClassNamesToElement(
      divRootContainer,
      // "grid grid-cols-[10px_1fr] gap-2 pt-2 items-start border-t border-t-2 border-neutral-content [&+[data-footnote-block-container]]:border-t-0",
      "luf-block",
    );

    const sup = document.createElement("sup");
    sup.setAttribute(BLOCK_ATTR.reference_id, this.__referenceId);
    sup.setAttribute(BLOCK_ATTR.order, this.__order.toString());
    sup.textContent = this.__order.toString();
    // addClassNamesToElement(sup, "cursor-pointer static top-0 pt-2");
    addClassNamesToElement(sup, "luf-block-order");
    divRootContainer.appendChild(sup);
    const divNestedEditor = document.createElement("div");
    divNestedEditor.setAttribute(BLOCK_ATTR_NESTED_EDITOR.container, "");
    addClassNamesToElement(
      divNestedEditor,
      // "border-l-2 border-neutral-content pl-2",
      // "luf-block-editor",
      "luf-block-editor-static",
    );
    // addClassNamesToElement(divNestedEditor, "col-span-full");
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

  static importJSON(
    serializedNode: SerializedFootnoteBlockNode,
  ): FootnoteBlockNode {
    return $createFootnoteBlockNode().updateFromJSON(serializedNode);
  }
  updateFromJSON(serializedNode: SerializedFootnoteBlockNode): this {
    return super
      .updateFromJSON(serializedNode)
      .setReferenceId(serializedNode.referenceId)
      .setBlockNote(serializedNode.blockNote);
  }

  exportJSON(): SerializedFootnoteBlockNode {
    if (!this.__referenceId) {
      throw new Error("Node ID is required");
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
  component(): ComponentType<BlockComponentProps> | null {
    return FootnoteBlockComponent;
  }

  decorate(editor: LexicalEditor): React.ReactNode {
    const Component = this.component();
    if (!Component) return null;
    const referenceId = this.getReferenceId();
    const order = this.getOrder();
    return (
      <Component
        nodeKey={this.getKey()}
        referenceId={referenceId}
        order={order}
        blockNote={this.__blockNote}
      />
    );
  }
}

let BlockNodeClass: typeof FootnoteBlockNode = FootnoteBlockNode;
export const registerBlockNodeClass = (klass: typeof FootnoteBlockNode) => {
	BlockNodeClass = klass;
}
export const $createFootnoteBlockNode = (
  referenceId?: string,
  order?: number,
  blockNote?: LexicalEditor,
): FootnoteBlockNode => {
  const editor = createEditor({
    nodes: [TextNode, ParagraphNode, LinkNode, HeadingNode],
    theme: theme,
    namespace: BLOCK_ATTR_NESTED_EDITOR.namespace,
  });
  // const node = new FootnoteBlockNode();
  const node = new BlockNodeClass();
  if (referenceId) {
    node.setReferenceId(referenceId);
  }
  if (blockNote) {
    node.setBlockNoteFromEditor(blockNote);
  }
  if (!blockNote) {
    node.setBlockNoteFromEditor(editor);
  }
  if (order) {
    node.setOrder(order);
  }
  return node;
};

export const $isFootnoteBlockNode = (
  node: LexicalNode | null,
): node is FootnoteBlockNode => {
  return node instanceof FootnoteBlockNode;
};
